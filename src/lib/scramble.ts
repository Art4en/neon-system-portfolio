import { prefersReducedMotion } from './env';

const GLYPHS = '!<>-_/[]{}=+*^?#%$01ABCDEFXZ';
export const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

/**
 * Effet « scramble / decrypt » : chaque caractère passe par des glyphes aléatoires
 * puis se résout, de gauche à droite avec un léger aléa. Écrit directement dans le DOM
 * (aucun re-render React). Retourne une fonction d'annulation.
 */
export function scrambleTo(
  el: HTMLElement,
  text: string,
  { duration = 0.6, onDone }: { duration?: number; onDone?: () => void } = {},
): () => void {
  if (prefersReducedMotion()) {
    el.textContent = text;
    onDone?.();
    return () => {};
  }
  const n = text.length;
  const resolveAt = Array.from(
    { length: n },
    (_, i) => (i / Math.max(1, n)) * 0.7 + Math.random() * 0.3,
  );
  const start = performance.now();
  let raf = 0;
  let lastSwap = 0;
  let current = text.split('').map((c) => (c === ' ' ? ' ' : randomGlyph()));
  const step = (now: number) => {
    const t = (now - start) / (duration * 1000);
    if (now - lastSwap > 40) {
      lastSwap = now;
      current = current.map((_, i) => (text[i] === ' ' ? ' ' : randomGlyph()));
    }
    let out = '';
    for (let i = 0; i < n; i++) out += t >= resolveAt[i] ? text[i] : current[i];
    el.textContent = out;
    if (t < 1) raf = requestAnimationFrame(step);
    else {
      el.textContent = text;
      onDone?.();
    }
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
