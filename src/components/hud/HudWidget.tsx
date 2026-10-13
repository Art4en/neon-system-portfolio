import { useEffect, useRef } from 'react';
import { runtime } from '../../store/runtime';
import { useAppStore } from '../../store/useAppStore';
import { pad } from '../../lib/math';
import { gsap } from '../../lib/gsap';

/** Widget HUD : coordonnées souris, FPS réels, heure système, statut ONLINE. */
export function HudWidget() {
  const coords = useRef<HTMLSpanElement>(null);
  const fps = useRef<HTMLSpanElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const quality = useAppStore((s) => s.quality);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let lastText = 0;
    // Branché sur gsap.ticker : le même requestAnimationFrame que Lenis / ScrollTrigger / la scène.
    const loop = () => {
      const now = performance.now();
      frames++;
      if (now - last >= 500) {
        runtime.fps = Math.round((frames * 1000) / (now - last));
        frames = 0;
        last = now;
        if (fps.current) {
          fps.current.textContent = String(runtime.fps).padStart(2, '0');
          fps.current.dataset.low = runtime.fps < 40 ? '1' : '';
        }
      }
      // Mise à jour du texte ~20 fois / seconde : largement suffisant et léger.
      if (now - lastText > 50) {
        lastText = now;
        const { x, y, active } = runtime.mouse;
        if (coords.current)
          coords.current.textContent = active ? `X:${pad(x)} Y:${pad(y)}` : 'X:---- Y:----';
        if (clock.current) clock.current.textContent = new Date().toLocaleTimeString('fr-FR');
      }
    };
    gsap.ticker.add(loop);
    return () => gsap.ticker.remove(loop);
  }, []);

  return (
    <div className="hud-widget" aria-hidden="true">
      <span ref={coords}>X:---- Y:----</span>
      <span>
        FPS{' '}
        <span ref={fps} className="hud-widget__fps">
          60
        </span>{' '}
        · GFX {quality.toUpperCase()}
      </span>
      <span ref={clock}>--:--:--</span>
      <span className="hud-widget__online">● ONLINE</span>
    </div>
  );
}
