import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { prefersReducedMotion } from '../../lib/env';

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** Compteur qui défile jusqu'à sa valeur quand il entre à l'écran. */
export function Counter({ value, suffix = '', duration = 1.8, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const format = (v: number) => Math.round(v).toLocaleString('fr-FR') + suffix;
    if (prefersReducedMotion()) {
      el.textContent = format(value);
      return;
    }
    el.textContent = format(0);
    const obj = { v: 0 };
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      tween = gsap.to(obj, {
        v: value,
        duration,
        ease: 'expo.out',
        onUpdate: () => {
          el.textContent = format(obj.v);
        },
      });
    });
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [value, suffix, duration]);
  return (
    <span className={className}>
      <span className="sr-only">{value.toLocaleString('fr-FR') + suffix}</span>
      <span ref={ref} aria-hidden="true" className="tabular-nums" />
    </span>
  );
}
