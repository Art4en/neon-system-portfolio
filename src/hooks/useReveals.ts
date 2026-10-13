import { gsap, SplitText, useGSAP } from '../lib/gsap';
import { usePlaying } from './usePlaying';
import { scrambleTo } from '../lib/scramble';
import { runtime } from '../store/runtime';
import { clamp } from '../lib/math';

type Variant = (tl: gsap.core.Timeline, title: HTMLElement) => void;

/**
 * Animations d'entrée des en-têtes de section. Chaque section a sa propre variante :
 * jamais deux fois la même d'affilée.
 */
const VARIANTS: Record<string, Variant> = {
  // Lettres qui se redressent depuis le bas (rotation 3D).
  rise: (tl, title) => {
    const split = SplitText.create(title, { type: 'words,chars' });
    tl.from(split.chars, {
      yPercent: 110,
      rotationX: -90,
      opacity: 0,
      transformOrigin: '50% 100%',
      duration: 1,
      ease: 'expo.out',
      stagger: 0.035,
    });
  },
  // Décryptage du titre + balayage de gauche à droite.
  scramble: (tl, title) => {
    const text = title.textContent ?? '';
    tl.fromTo(
      title,
      { clipPath: 'inset(0 100% 0 0)' },
      {
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.9,
        ease: 'power4.inOut',
        onStart: () => void scrambleTo(title, text, { duration: 1 }),
      },
    );
  },
  // Volet qui s'ouvre en biais.
  wipe: (tl, title) => {
    tl.from(title, {
      clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
      skewX: -18,
      x: -60,
      duration: 1.2,
      ease: 'expo.out',
    });
  },
  // Titre étiré qui se resserre et se met au point (transform + opacité uniquement : fluide).
  focus: (tl, title) => {
    tl.from(title, {
      scaleX: 1.5,
      opacity: 0,
      transformOrigin: '50% 50%',
      duration: 1.3,
      ease: 'expo.out',
    });
  },
  // Néon qui s'allume en clignotant.
  flicker: (tl, title) => {
    tl.fromTo(
      title,
      { opacity: 0 },
      {
        keyframes: { opacity: [0, 1, 0.2, 1, 0.4, 0.1, 1, 0.6, 1] },
        duration: 1.1,
        ease: 'none', // les paliers du clignotement sont dans les keyframes
      },
    );
  },
};

/** Ordre des variantes par section (le Contact a sa propre animation de lettres). */
const ORDER: Record<string, keyof typeof VARIANTS | null> = {
  about: 'rise',
  skills: 'scramble',
  projects: 'wipe',
  timeline: 'focus',
  terminal: 'flicker',
  contact: null,
};

export function useReveals() {
  const playing = usePlaying();
  useGSAP(
    () => {
      if (!playing) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-anim="header"]').forEach((header) => {
          const section = header.closest('section');
          const id = section?.id ?? '';
          const title = header.querySelector<HTMLElement>('[data-anim="title"]');
          const micro = header.querySelector<HTMLElement>('[data-anim="micro"]');
          const intro = header.querySelector<HTMLElement>('[data-anim="intro"]');
          const num = header.querySelector<HTMLElement>('.section-num');
          const tl = gsap.timeline({ scrollTrigger: { trigger: header, start: 'top 82%' } });

          if (num) tl.from(num, { opacity: 0, scale: 0.85, duration: 1.4, ease: 'expo.out' }, 0);
          if (micro) tl.from(micro, { opacity: 0, x: -24, duration: 0.7, ease: 'power3.out' }, 0);
          const variant = ORDER[id];
          if (title && variant) {
            const sub = gsap.timeline();
            VARIANTS[variant](sub, title);
            tl.add(sub, 0.1);
          }
          if (intro) tl.from(intro, { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out' }, 0.45);

          // Parallaxe des éléments décoratifs (numéro géant, codes hexa flottants).
          header.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
            const k = Number(el.dataset.parallax) || 0.2;
            gsap.to(el, {
              yPercent: k * 120,
              ease: 'none', // lié 1:1 au scroll
              scrollTrigger: {
                trigger: section ?? header,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            });
          });
        });

        // Léger skew des titres selon la vitesse du scroll (lu dans runtime, lissé).
        const titles = gsap.utils.toArray<HTMLElement>('.section-title');
        const setters = titles.map((t) => gsap.quickSetter(t, 'skewY', 'deg'));
        let skew = 0;
        const tick = () => {
          const target = clamp(runtime.velocity * 0.06, -3, 3);
          skew += (target - skew) * 0.12;
          if (Math.abs(skew) < 0.01 && Math.abs(target) < 0.01) return;
          setters.forEach((set) => set(skew));
        };
        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      });
      return () => mm.revert();
    },
    { dependencies: [playing] },
  );
}
