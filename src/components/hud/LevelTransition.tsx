import { useEffect, useRef, useState } from 'react';
import { SECTIONS } from '../../lib/sections';
import { useAppStore } from '../../store/useAppStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { sfx } from '../../audio/synth';

/** Bandeau « LOADING NEXT LEVEL ▓▓▓▓░░ » qui traverse l'écran à chaque changement de niveau. */
export function LevelTransition() {
  const active = useAppStore((s) => s.activeIndex);
  const playing = useAppStore((s) => s.phase === 'playing');
  const rewinding = useAppStore((s) => s.rewinding);
  const reduced = useReducedMotion();
  const [band, setBand] = useState<{ key: number; index: number } | null>(null);
  const prev = useRef(active);
  const last = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    const from = prev.current;
    prev.current = active;
    if (!playing || reduced || rewinding || from === active) return;
    const now = performance.now();
    if (now - last.current < 1400) return; // pas de bandeau en rafale si on scrolle très vite
    last.current = now;
    useAppStore.getState().glitch();
    sfx.whoosh();
    // Timers volontairement non annulés au changement suivant : le bandeau doit toujours disparaître.
    timers.current = [
      window.setTimeout(() => setBand({ key: now, index: active }), 0),
      window.setTimeout(() => setBand(null), 1100),
    ];
  }, [active, playing, reduced, rewinding]);

  if (!band) return null;
  const s = SECTIONS[band.index];
  return (
    <div key={band.key} className="level-band" aria-hidden="true">
      <div className="level-band__inner">
        <span>LOADING NEXT LEVEL</span>
        <span className="level-band__bar">▓▓▓▓▓▓░░</span>
        <span className="text-accent">
          LVL {s.num} — {s.title}
        </span>
      </div>
    </div>
  );
}
