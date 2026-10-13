import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { runtime } from '../../store/runtime';
import { isTouch } from '../../lib/env';

/** Halo radial doux qui suit la souris sur le fond (sous le contenu). */
export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || isTouch) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
    const move = () => {
      x(runtime.mouse.x);
      y(runtime.mouse.y);
      el.style.opacity = runtime.mouse.active ? '1' : '0';
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div ref={ref} className="spotlight" aria-hidden="true" />;
}
