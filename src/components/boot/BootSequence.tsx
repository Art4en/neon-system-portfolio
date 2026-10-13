import { useEffect, useRef, useState } from 'react';
import { handle } from '../../lib/content';
import { useAppStore } from '../../store/useAppStore';
import { gsap } from '../../lib/gsap';
import { hasWebGL } from '../../lib/env';
import { startScroll, stopScroll } from '../../lib/scroll';
import { sfx } from '../../audio/synth';

interface BootLine {
  text: string;
  /** Statut affiché quand l'étape est terminée. */
  status: string;
  done: boolean;
}

const BAR = 20;

/**
 * Séquence de démarrage type BIOS, liée à la VRAIE progression du chargement :
 * polices → compilation des shaders (première image de la scène) → montage → assets.
 * Puis « PRESS START ». Un bouton SKIP est toujours disponible.
 */
export function BootSequence({ onStart }: { onStart: () => void }) {
  const sceneReady = useAppStore((s) => s.sceneReady);
  const [fontsReady, setFontsReady] = useState(false);
  const [sceneTimeout, setSceneTimeout] = useState(false);
  const [shown, setShown] = useState(1);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const barRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const pressRef = useRef<HTMLButtonElement>(null);
  const progress = useRef({ v: 0 });
  const started = useRef(false);

  useEffect(() => {
    stopScroll();
    return () => startScroll();
  }, []);

  useEffect(() => {
    let alive = true;
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3500))]).then(
      () => alive && setFontsReady(true),
    );
    // Si le GPU est très lent, on ne bloque pas le joueur plus de 9 s.
    const t = window.setTimeout(() => setSceneTimeout(true), 9000);
    return () => {
      alive = false;
      window.clearTimeout(t);
    };
  }, []);

  const shaders = !hasWebGL || sceneReady || sceneTimeout;
  const lines: BootLine[] = [
    { text: '> INITIALIZING NEON//SYSTEM v2.0', status: '', done: true },
    { text: '> LOADING KERNEL MODULES ........', status: '[OK]', done: fontsReady },
    {
      text: '> COMPILING SHADERS .............',
      status: hasWebGL ? (sceneReady ? '[OK]' : '[SLOW]') : '[SKIP · NO WEBGL]',
      done: shaders,
    },
    { text: `> MOUNTING /portfolio/${handle.toLowerCase()} ..`, status: '[OK]', done: true },
    { text: '> CALIBRATING NEON GRID .........', status: '[OK]', done: true },
  ];

  // Révèle la ligne suivante quand la précédente est terminée.
  const lastDone = lines[shown - 1]?.done;
  useEffect(() => {
    if (!lastDone || shown >= lines.length) return;
    const t = window.setTimeout(() => setShown((s) => s + 1), 220);
    return () => window.clearTimeout(t);
  }, [lastDone, shown, lines.length]);

  // Barre de progression : suit le nombre d'étapes réellement terminées.
  const doneCount = lines.slice(0, shown).filter((l) => l.done).length;
  const allDone = shown === lines.length && lines.every((l) => l.done);
  useEffect(() => {
    const target = (doneCount / lines.length) * 100;
    const tween = gsap.to(progress.current, {
      v: target,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        const v = Math.round(progress.current.v);
        const n = Math.round((v / 100) * BAR);
        if (barRef.current) barRef.current.textContent = '█'.repeat(n) + '░'.repeat(BAR - n);
        if (pctRef.current) pctRef.current.textContent = `${v}%`;
      },
      onComplete: () => {
        if (allDone) setReady(true);
      },
    });
    return () => {
      tween.kill();
    };
  }, [doneCount, lines.length, allDone]);

  useEffect(() => {
    if (ready) pressRef.current?.focus({ preventScroll: true });
  }, [ready]);

  const start = () => {
    if (started.current) return;
    started.current = true;
    sfx.boot();
    setLeaving(true);
    onStart();
  };

  // N'importe quelle touche lance la partie une fois prêt.
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Shift') return;
      e.preventDefault();
      start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className={`boot ${leaving ? 'is-leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Démarrage du système"
    >
      <div className="boot__screen">
        <div className="boot__log" aria-live="polite">
          {lines.slice(0, shown).map((l, i) => (
            <p key={i} className="boot__line">
              <span>{l.text}</span>{' '}
              {l.status &&
                (l.done ? (
                  <span className={l.status === '[OK]' ? 'boot__ok' : 'boot__warn'}>
                    {l.status}
                  </span>
                ) : (
                  <span className="boot__wait">…</span>
                ))}
            </p>
          ))}
          <p className="boot__line boot__progress" aria-hidden="true">
            &gt; [<span ref={barRef}>{'░'.repeat(BAR)}</span>] <span ref={pctRef}>0%</span>
          </p>
        </div>

        <div className={`boot__press ${ready ? 'is-ready' : ''}`}>
          {ready && (
            <>
              <button
                ref={pressRef}
                type="button"
                className="boot__start h-display"
                onClick={start}
              >
                Press start
              </button>
              <p className="micro mt-4">[ clique ou appuie sur une touche ]</p>
              <p className="micro mt-2">🔊 Le son est coupé — active-le dans le HUD</p>
            </>
          )}
        </div>
      </div>

      <button type="button" className="boot__skip" onClick={start}>
        Skip ▸▸
      </button>
      <div className="boot__flash" aria-hidden="true" />
    </div>
  );
}
