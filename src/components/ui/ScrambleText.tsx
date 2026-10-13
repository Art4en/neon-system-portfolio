import { useEffect, useRef } from 'react';
import type { TextTag } from './tags';
import { scrambleTo } from '../../lib/scramble';

interface ScrambleTextProps {
  text: string;
  as?: TextTag;
  className?: string;
  /** 'mount' : au montage et à chaque changement de texte ; 'hover' : au survol du parent interactif. */
  trigger?: 'mount' | 'hover';
  duration?: number;
}

/** Texte qui se « décrypte ». Le vrai texte reste lisible par les lecteurs d'écran. */
export function ScrambleText({
  text,
  as: Tag = 'span',
  className,
  trigger = 'mount',
  duration = 0.55,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || trigger !== 'mount') return;
    return scrambleTo(el, text, { duration });
  }, [text, trigger, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el || trigger !== 'hover') return;
    const host = el.closest('a, button') ?? el.parentElement;
    if (!host) return;
    let cancel = () => {};
    const run = () => {
      cancel();
      cancel = scrambleTo(el, text, { duration });
    };
    host.addEventListener('pointerenter', run);
    host.addEventListener('focus', run);
    return () => {
      cancel();
      host.removeEventListener('pointerenter', run);
      host.removeEventListener('focus', run);
    };
  }, [text, trigger, duration]);

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" ref={ref}>
        {text}
      </span>
    </Tag>
  );
}
