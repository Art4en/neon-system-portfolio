import { useEffect, useRef, type MouseEvent, type ReactNode, type RefObject } from 'react';
import { gsap } from '../../lib/gsap';
import { isTouch, prefersReducedMotion } from '../../lib/env';
import { sfx } from '../../audio/synth';

interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  className?: string;
  /** Force d'attraction (0 → 1). */
  strength?: number;
  disabled?: boolean;
  /** Label du curseur custom (VIEW, OPEN, COPY…). */
  cursor?: string;
  download?: boolean | string;
  external?: boolean;
  ariaLabel?: string;
  title?: string;
  type?: 'button' | 'submit';
}

/** Bouton magnétique : attiré par le curseur, retour élastique, ondulation néon au clic. */
export function MagneticButton({
  children,
  href,
  onClick,
  className = 'btn-neon',
  strength = 0.35,
  disabled,
  cursor,
  download,
  external,
  ariaLabel,
  title,
  type = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner || isTouch || prefersReducedMotion() || disabled) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const ixTo = gsap.quickTo(inner, 'x', { duration: 0.5, ease: 'power3.out' });
    const iyTo = gsap.quickTo(inner, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo(dx * strength * 0.45);
      iyTo(dy * strength * 0.45);
    };
    const leave = () => {
      gsap.to([el, inner], {
        x: 0,
        y: 0,
        duration: 1.1,
        ease: 'elastic.out(1, 0.35)',
        overwrite: true,
      });
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [strength, disabled]);

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    const el = ref.current;
    if (el && !prefersReducedMotion()) {
      const r = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height) * 2.4;
      ripple.className = 'ripple';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
      el.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 750);
    }
    sfx.blip();
    onClick?.(e);
  };

  const common = {
    className,
    onClick: handleClick,
    onPointerEnter: () => sfx.hover(),
    'data-cursor': disabled ? undefined : cursor,
    'aria-label': ariaLabel,
    title,
  };
  const content = (
    <span ref={innerRef} className="relative inline-flex items-center gap-[inherit]">
      {children}
    </span>
  );

  if (href && !disabled) {
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        download={download}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        {...common}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      ref={ref as RefObject<HTMLButtonElement>}
      type={type}
      aria-disabled={disabled || undefined}
      {...common}
    >
      {content}
    </button>
  );
}
