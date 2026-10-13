import { useEffect, useRef } from 'react';

const KONAMI = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName));

/**
 * Easter eggs clavier :
 * - Konami code (↑ ↑ ↓ ↓ ← → ← → B A) → onKonami
 * - taper « matrix » n'importe où sur la page (hors champ de saisie) → onWord('matrix')
 */
export function useKonami(
  onKonami: () => void,
  onWord: (word: string) => void,
  words: string[] = ['matrix'],
) {
  const cb = useRef({ onKonami, onWord });
  useEffect(() => {
    cb.current = { onKonami, onWord };
  });
  useEffect(() => {
    let seq: string[] = [];
    let typed = '';
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      seq = [...seq, k].slice(-KONAMI.length);
      if (seq.length === KONAMI.length && seq.every((v, i) => v === KONAMI[i])) {
        seq = [];
        cb.current.onKonami();
      }
      if (k.length === 1) {
        typed = (typed + k).slice(-16);
        for (const w of words)
          if (typed.endsWith(w)) {
            typed = '';
            cb.current.onWord(w);
          }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [words]);
}
