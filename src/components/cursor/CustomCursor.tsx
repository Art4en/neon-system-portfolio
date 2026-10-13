import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { runtime } from '../../store/runtime';

const INTERACTIVE = 'a, button, [role="button"], [data-cursor], input, textarea, select, label';

/**
 * Réticule de visée (desktop uniquement) : suit la souris avec un léger retard,
 * se rétracte au clic, s'agrandit sur les éléments interactifs et affiche un label (VIEW, OPEN…).
 * Une traînée de particules légère le suit (canvas 2D).
 */
export function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const trail = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState<'idle' | 'hover' | 'text'>('idle');
  const [down, setDown] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('has-cursor');
    const r = ring.current!;
    const d = dot.current!;
    const canvas = trail.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = { x: runtime.mouse.x, y: runtime.mouse.y };
    const parts: { x: number; y: number; life: number; vx: number; vy: number }[] = [];
    let lastSpawn = { x: 0, y: 0 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
      if (!el) {
        setMode('idle');
        setLabel('');
        return;
      }
      const isText = el.matches('input, textarea') || el.dataset.cursor === 'TYPE';
      setMode(isText ? 'text' : 'hover');
      setLabel(el.dataset.cursor ?? '');
    };
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);
    const onMove = () => setHidden(false);

    const tick = () => {
      const { x, y } = runtime.mouse;
      // lerp indépendant du framerate (22 % du chemin par image à 60 FPS)
      const k = 1 - Math.pow(1 - 0.22, gsap.ticker.deltaRatio(60));
      pos.x += (x - pos.x) * k;
      pos.y += (y - pos.y) * k;
      r.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      // Traînée : quelques particules qui s'estompent.
      const dx = x - lastSpawn.x;
      const dy = y - lastSpawn.y;
      if (dx * dx + dy * dy > 64 && parts.length < 60) {
        parts.push({
          x,
          y,
          life: 1,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
        });
        lastSpawn = { x, y };
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life -= 0.035;
        p.x += p.vx;
        p.y += p.vy;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `rgba(0, 240, 255, ${p.life * 0.55})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2 + p.life * 1.5, 2 + p.life * 1.5);
      }
    };

    gsap.ticker.add(tick);
    document.addEventListener('pointerover', onOver);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    document.documentElement.addEventListener('pointerenter', onEnter);
    window.addEventListener('resize', resize);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      gsap.ticker.remove(tick);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className={`cursor ${hidden ? 'is-hidden' : ''}`} aria-hidden="true">
      <canvas ref={trail} className="cursor__trail" />
      <div ref={ring} className="cursor__ring-pos">
        <div className={`cursor__ring is-${mode} ${down ? 'is-down' : ''}`}>
          <i className="cursor__tick cursor__tick--t" />
          <i className="cursor__tick cursor__tick--r" />
          <i className="cursor__tick cursor__tick--b" />
          <i className="cursor__tick cursor__tick--l" />
        </div>
        {label && <span className="cursor__label">{label}</span>}
      </div>
      <div ref={dot} className="cursor__dot-pos">
        <div className={`cursor__dot ${down ? 'is-down' : ''}`} />
      </div>
    </div>
  );
}
