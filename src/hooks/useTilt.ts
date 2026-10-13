import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { isTouch, prefersReducedMotion } from '../lib/env';

/**
 * Tilt 3D qui suit la souris + variables CSS --mx / --my (position du reflet holographique).
 */
export function useTilt(ref: RefObject<HTMLElement | null>, { max = 10, scale = 1.02 } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch || prefersReducedMotion()) return;
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const sx = gsap.quickTo(el, 'scaleX', { duration: 0.6, ease: 'power3.out' });
    const sy = gsap.quickTo(el, 'scaleY', { duration: 0.6, ease: 'power3.out' });
    const sc = (v: number) => {
      sx(v);
      sy(v);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      ry((px - 0.5) * max * 2);
      rx(-(py - 0.5) * max * 2);
      sc(scale);
    };
    const leave = () => {
      rx(0);
      ry(0);
      sc(1);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [ref, max, scale]);
}
