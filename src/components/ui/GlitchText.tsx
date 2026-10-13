import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { TextTag } from './tags';
import { useAppStore } from '../../store/useAppStore';
import { prefersReducedMotion } from '../../lib/env';

interface GlitchTextProps {
  text: string;
  as?: TextTag;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Glitch automatique aléatoire (toutes les quelques secondes). */
  auto?: boolean;
  /** Glitch au survol. */
  hover?: boolean;
  minDelay?: number;
  maxDelay?: number;
}

/** Déclenche un glitch bref sur un élément `.glitch` (sauf si data-glitch-off est posé). */
function fireGlitch(el: HTMLElement | null) {
  if (!el || prefersReducedMotion() || el.dataset.glitchOff) return;
  el.classList.remove('is-glitching');
  void el.offsetWidth; // relance l'animation CSS
  el.classList.add('is-glitching');
  window.setTimeout(() => el.classList.remove('is-glitching'), 450);
}

/**
 * Glitch RGB : deux couches ::before / ::after (cyan / magenta) décalées et découpées,
 * déclenchées brièvement — jamais en permanence pour ne pas gêner la lecture.
 */
export function GlitchText({
  text,
  as: Tag = 'span',
  className = '',
  style,
  children,
  auto = true,
  hover = false,
  minDelay = 3000,
  maxDelay = 7000,
}: GlitchTextProps) {
  const ref = useRef<HTMLElement>(null);
  const glitchTick = useAppStore((s) => s.glitchTick);

  useEffect(() => {
    if (!auto || prefersReducedMotion()) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          if (!document.hidden) fireGlitch(ref.current);
          schedule();
        },
        minDelay + Math.random() * (maxDelay - minDelay),
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [auto, minDelay, maxDelay]);

  useEffect(() => {
    if (glitchTick > 0) fireGlitch(ref.current);
  }, [glitchTick]);

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        ref.current = el;
      }}
      className={`glitch ${className}`}
      style={style}
      data-text={text}
      onPointerEnter={hover ? () => fireGlitch(ref.current) : undefined}
    >
      {children ?? text}
    </Tag>
  );
}
