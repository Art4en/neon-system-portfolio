import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useAppStore } from '../../store/useAppStore';
import { prefersReducedMotion } from '../../lib/env';

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン{}</>=;01'.split(
    '',
  );
const SIZE = 16;

/**
 * Pluie de code « Matrix » en canvas 2D. Très discrète en temps normal (opacité ~0.06),
 * elle envahit l'écran pendant les easter eggs (commande `matrix`, Konami, God Mode).
 */
export function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    let cols: number[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Array.from({ length: Math.ceil(canvas.width / SIZE) }, () => Math.random() * -60);
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let last = 0;
    let level = 0;
    const draw = () => {
      const st = useAppStore.getState();
      const now = performance.now();
      const intense = st.godMode || now < st.matrixUntil;
      // Opacité du calque : discrète → plein écran pendant les effets secrets.
      level += ((intense ? 0.9 : 0.06) - level) * 0.06;
      canvas.style.opacity = level.toFixed(3);
      const reduced = prefersReducedMotion();
      // Rien à dessiner pendant le boot (le calque est caché) ni en mouvement réduit.
      if ((reduced || st.phase === 'boot') && !intense) return;
      // 15 images/s en temps normal, 30 pendant les effets : largement suffisant pour ce rendu.
      if (now - last < (intense ? 33 : 66)) return;
      last = now;
      ctx.fillStyle = 'rgba(5, 6, 10, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${SIZE}px "JetBrains Mono Variable", monospace`;
      const green = intense || st.godMode;
      for (let i = 0; i < cols.length; i++) {
        const y = cols[i] * SIZE;
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillStyle = Math.random() > 0.975 ? '#e6edf3' : green ? '#39ff14' : '#00f0ff';
        ctx.fillText(ch, i * SIZE, y);
        if (y > canvas.height && Math.random() > 0.975) cols[i] = 0;
        cols[i] += 1;
      }
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="matrix-rain" aria-hidden="true" />;
}
