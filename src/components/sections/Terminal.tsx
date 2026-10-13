import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { usePlaying } from '../../hooks/usePlaying';
import { handle } from '../../lib/content';
import { complete, runCommand, type Line } from '../../lib/terminalCommands';
import { useAppStore } from '../../store/useAppStore';
import { prefersReducedMotion } from '../../lib/env';
import { gsap, useGSAP } from '../../lib/gsap';
import { sfx } from '../../audio/synth';
import { SectionHeader } from '../ui/SectionHeader';

const PROMPT = `${handle.toLowerCase()}@neon-system:~$`;
const QUICK = ['help', 'whoami', 'skills', 'projects', 'sudo hire-me', 'play'];

interface Shown extends Line {
  id: number;
  /** Nombre de caractères déjà « tapés ». */
  shown: number;
}

let lineId = 0;

/** 06 — CONSOLE : vrai terminal interactif branché sur le fichier de contenu. */
export function Terminal() {
  const playing = usePlaying();
  const [lines, setLines] = useState<Shown[]>(() =>
    [
      { text: 'NEON//SYSTEM terminal v2.0 — connexion établie.', kind: 'sys' as const },
      { text: 'Tape « help » pour voir les commandes disponibles.', kind: 'sys' as const },
    ].map((l) => ({ ...l, id: ++lineId, shown: l.text.length })),
  );
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const unlock = useAppStore((s) => s.unlock);

  // Les réponses s'écrivent progressivement (plusieurs caractères par frame).
  const typing = lines.some((l) => l.shown < l.text.length);
  useEffect(() => {
    if (!typing) return;
    let raf = 0;
    const step = () => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.shown < l.text.length);
        if (i === -1) return prev;
        const next = prev.slice();
        next[i] = { ...next[i], shown: Math.min(next[i].text.length, next[i].shown + 6) };
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [typing]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  useGSAP(
    () => {
      if (!playing) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Fenêtre qui « s'allume » comme un vieux moniteur CRT.
        gsap.from('[data-anim="term"]', {
          scaleY: 0.004,
          scaleX: 0.6,
          opacity: 0,
          duration: 0.9,
          ease: 'expo.out',
          scrollTrigger: { trigger: '[data-anim="term"]', start: 'top 80%' },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [playing] },
  );

  const exec = (raw: string) => {
    const cmd = raw.trim();
    unlock('hacker');
    let cleared = false;
    const out = runCommand(cmd, {
      history,
      clear: () => {
        cleared = true;
      },
    });
    const instant = prefersReducedMotion();
    const echo: Shown = { text: `${PROMPT} ${cmd}`, kind: 'cmd', id: ++lineId, shown: 9999 };
    const added = out.map((l) => ({ ...l, id: ++lineId, shown: instant ? l.text.length : 0 }));
    setLines((prev) => (cleared ? [] : [...prev, echo, ...added]));
    if (out.some((l) => l.kind === 'err')) sfx.error();
    else sfx.blip();
    if (cmd) setHistory((h) => [...h, cmd]);
    setCursor(-1);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      exec(value);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const c = complete(value);
      if (c) setValue(c);
      else sfx.error();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor === -1) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key.length === 1) {
      sfx.tick();
    }
  };

  return (
    <section ref={root} id="terminal" className="section" aria-labelledby="terminal-title">
      <div className="section-inner">
        <SectionHeader id="terminal" align="center" />

        <div
          className="term"
          data-anim="term"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <div className="term__bar">
            <span className="term__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="micro">{PROMPT.replace(':~$', '')} — zsh — 80×24</span>
            <span className="micro hidden sm:inline">● LIVE</span>
          </div>
          <div
            ref={bodyRef}
            className="term__body"
            data-lenis-prevent=""
            role="log"
            aria-live="polite"
            aria-label="Sortie du terminal"
          >
            {lines.map((l) => (
              <p key={l.id} className={`term__line term__line--${l.kind}`}>
                {l.text.slice(0, l.shown) || ' '}
              </p>
            ))}
            <div className="term__input-row">
              <label htmlFor="term-input" className="term__prompt">
                {PROMPT}
              </label>
              <input
                ref={inputRef}
                id="term-input"
                className="term__input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                aria-label="Commande du terminal"
                data-cursor="TYPE"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-5" aria-label="Commandes rapides">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              className="chip term__quick"
              onClick={() => exec(q)}
              onPointerEnter={() => sfx.hover()}
            >
              &gt; {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
