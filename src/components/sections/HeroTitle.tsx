import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '../../lib/gsap';
import { randomGlyph } from '../../lib/scramble';
import { prefersReducedMotion } from '../../lib/env';
import { GlitchText } from '../ui/GlitchText';

/**
 * Nom géant du Hero :
 * - « decrypt » : chaque lettre fait défiler des glyphes aléatoires puis se résout, une par une ;
 * - glitch RGB aléatoire toutes les quelques secondes ;
 * - au scroll, les lettres se disloquent et s'envolent en 3D.
 */
export function HeroTitle({ text, start }: { text: string; start: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const words = text.split(/\s+/);
  const longest = Math.max(...words.map((w) => w.length));
  // Taille fluide : le mot le plus long doit tenir dans la largeur de l'écran.
  const vw = Math.min(14.5, 92 / (longest * 0.95));

  useEffect(() => {
    const host = ref.current;
    if (!host || !start) return;
    const chars = Array.from(host.querySelectorAll<HTMLElement>('[data-char]'));
    if (prefersReducedMotion()) {
      chars.forEach((c) => {
        c.textContent = c.dataset.char ?? '';
        c.classList.add('is-resolved');
      });
      return;
    }
    const t0 = performance.now();
    const resolveAt = chars.map((_, i) => 180 + i * 75 + Math.random() * 220);
    let raf = 0;
    let last = 0;
    const step = (now: number) => {
      const t = now - t0;
      const swap = now - last > 45;
      if (swap) last = now;
      let done = true;
      chars.forEach((c, i) => {
        if (t >= resolveAt[i]) {
          if (c.textContent !== c.dataset.char) {
            c.textContent = c.dataset.char ?? '';
            c.classList.add('is-resolved');
          }
        } else {
          done = false;
          if (swap) c.textContent = randomGlyph();
        }
      });
      if (!done) raf = requestAnimationFrame(step);
    };
    chars.forEach((c) => (c.textContent = randomGlyph()));
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, text]);

  useGSAP(
    () => {
      if (!start) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const chars = gsap.utils.toArray<HTMLElement>('[data-char]', ref.current);
        gsap.to(chars, {
          x: () => gsap.utils.random(-320, 320),
          y: () => gsap.utils.random(-260, 40),
          z: () => gsap.utils.random(150, 650),
          rotationX: () => gsap.utils.random(-140, 140),
          rotationY: () => gsap.utils.random(-140, 140),
          rotationZ: () => gsap.utils.random(-50, 50),
          opacity: 0,
          ease: 'power2.in',
          stagger: { each: 0.025, from: 'center' },
          scrollTrigger: {
            trigger: ref.current?.closest('section') ?? undefined,
            start: 'top top',
            end: '75% top',
            scrub: 0.8,
            onUpdate: (self) => {
              const h = ref.current?.querySelector<HTMLElement>('.glitch');
              if (h) h.dataset.glitchOff = self.progress > 0.01 ? '1' : '';
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [start, text] },
  );

  return (
    <div
      ref={ref}
      className="hero__title-wrap"
      style={{ visibility: start ? 'visible' : 'hidden' }}
    >
      <h1 className="sr-only">{text}</h1>
      <GlitchText
        text={text}
        as="div"
        auto={start}
        hover
        className="hero__title h-display glow-text"
        style={{ fontSize: `clamp(2.3rem, ${vw}vw, 10.5rem)` }}
      >
        <span aria-hidden="true">
          {words.map((w, wi) => (
            <span key={wi} className="hero__word">
              {w.split('').map((c, ci) => (
                <span key={ci} className="hero__char" data-char={c}>
                  {c}
                </span>
              ))}
              {wi < words.length - 1 ? ' ' : null}
            </span>
          ))}
        </span>
      </GlitchText>
    </div>
  );
}
