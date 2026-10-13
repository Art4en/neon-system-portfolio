import { useEffect, useRef, useState } from 'react';
import { handle } from '../../lib/content';
import { useAppStore } from '../../store/useAppStore';
import { scrollToTarget } from '../../lib/scroll';
import { prefersReducedMotion } from '../../lib/env';
import { sfx } from '../../audio/synth';
import { GlitchText } from '../ui/GlitchText';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** FOOTER — « GAME OVER? » : rembobinage du voyage + générique de fin. */
export function Footer() {
  const [seconds, setSeconds] = useState(0);
  const start = useRef(0);
  const rewinding = useAppStore((s) => s.rewinding);

  useEffect(() => {
    start.current = performance.now();
    const id = window.setInterval(
      () => setSeconds(Math.floor((performance.now() - start.current) / 1000)),
      1000,
    );
    return () => window.clearInterval(id);
  }, []);

  const rewind = () => {
    const st = useAppStore.getState();
    if (st.rewinding) return;
    sfx.whoosh();
    st.glitch();
    if (prefersReducedMotion()) {
      scrollToTarget(0, { immediate: true });
      return;
    }
    // La scène 3D est liée au scroll : remonter vite en haut rejoue le voyage à l'envers.
    st.setRewinding(true);
    scrollToTarget(0, {
      duration: 2.8,
      onComplete: () => {
        useAppStore.getState().setRewinding(false);
        useAppStore.getState().unlock('timetraveler');
        useAppStore.getState().glitch();
      },
    });
  };

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const year = new Date().getFullYear();

  return (
    <footer className="footer" aria-label="Pied de page">
      <div className="footer__inner">
        <p className="micro mb-4">// END_OF_GAME</p>
        <GlitchText text="GAME OVER?" as="p" className="h-display footer__title glow-text" />
        <button
          type="button"
          className="btn-neon footer__continue"
          onClick={rewind}
          data-cursor="REWIND"
          disabled={rewinding}
          onPointerEnter={() => sfx.hover()}
        >
          Continue <span aria-hidden="true">▲</span>
        </button>
        <p className="micro mt-3">Retour au début — le voyage se rembobine</p>

        <div className="credits" aria-label="Crédits">
          <dl>
            <div>
              <dt>Directed by</dt>
              <dd>{handle}</dd>
            </div>
            <div>
              <dt>Design &amp; code</dt>
              <dd>{handle}</dd>
            </div>
            <div>
              <dt>Powered by</dt>
              <dd>React · Three.js · GSAP · Lenis</dd>
            </div>
            <div>
              <dt>Temps de jeu</dt>
              <dd className="tabular-nums">
                {pad2(h)}:{pad2(m)}:{pad2(s)}
              </dd>
            </div>
          </dl>
        </div>

        <p className="footer__copy">
          © {year} {handle} — Made with ☕ &amp; &lt;/&gt;
        </p>
        <p className="micro mt-2">Thanks for playing · Psst… essaie le Konami code</p>
      </div>
      {rewinding && (
        <div className="rewind-overlay" aria-hidden="true">
          <span>◀◀ REWIND</span>
        </div>
      )}
    </footer>
  );
}
