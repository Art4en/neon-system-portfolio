import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { sfx } from '../../audio/synth';

interface TypewriterProps {
  /** Une ou plusieurs phrases. Plusieurs → elles tournent (effacement puis réécriture). */
  lines: string[];
  start?: boolean;
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  hold?: number;
  caret?: boolean;
  /** Petit son de frappe (si le son est activé). */
  sound?: boolean;
}

/** Texte tapé comme dans un terminal, avec curseur █ clignotant. */
export function Typewriter({
  lines,
  start = true,
  className = '',
  typeSpeed = 42,
  deleteSpeed = 22,
  hold = 2600,
  caret = true,
  sound = false,
}: TypewriterProps) {
  const reduced = useReducedMotion();
  const [text, setText] = useState('');
  const key = lines.join('\u0000');

  useEffect(() => {
    const list = key.split('\u0000').filter(Boolean);
    if (!start || list.length === 0) return;
    let timer = 0;
    let line = 0;
    let i = 0;
    let deleting = false;
    let cancelled = false;

    if (reduced) {
      // Pas d'effet de frappe : affichage direct, alternance douce s'il y a plusieurs phrases.
      timer = window.setTimeout(() => setText(list[0]), 0);
      if (list.length < 2) return () => window.clearTimeout(timer);
      const interval = window.setInterval(() => {
        line = (line + 1) % list.length;
        setText(list[line]);
      }, hold + 2000);
      return () => {
        window.clearTimeout(timer);
        window.clearInterval(interval);
      };
    }

    const tick = () => {
      if (cancelled) return;
      const current = list[line];
      if (!deleting) {
        i++;
        setText(current.slice(0, i));
        if (sound && i % 2 === 0) sfx.tick();
        if (i >= current.length) {
          if (list.length === 1) return;
          deleting = true;
          timer = window.setTimeout(tick, hold);
          return;
        }
        timer = window.setTimeout(tick, typeSpeed + Math.random() * typeSpeed * 0.8);
      } else {
        i--;
        setText(current.slice(0, i));
        if (i <= 0) {
          deleting = false;
          line = (line + 1) % list.length;
          timer = window.setTimeout(tick, 380);
          return;
        }
        timer = window.setTimeout(tick, deleteSpeed);
      }
    };
    timer = window.setTimeout(tick, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key, start, reduced, typeSpeed, deleteSpeed, hold, sound]);

  return (
    <span className={className}>
      <span className="sr-only">{lines.join(' — ')}</span>
      <span aria-hidden="true">
        {text}
        {caret && <span className="caret" />}
      </span>
    </span>
  );
}
