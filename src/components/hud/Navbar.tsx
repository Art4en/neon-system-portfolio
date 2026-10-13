import { useRef } from 'react';
import { Menu } from 'lucide-react';
import { SECTIONS } from '../../lib/sections';
import { handle } from '../../lib/content';
import { useAppStore } from '../../store/useAppStore';
import { runtime } from '../../store/runtime';
import { scrollToTarget } from '../../lib/scroll';
import { sfx } from '../../audio/synth';
import { GlitchText } from '../ui/GlitchText';
import { ScrambleText } from '../ui/ScrambleText';
import { SoundToggle } from './SoundToggle';
import { QualityToggle } from './QualityToggle';

const NAV = SECTIONS.filter((s) => s.id !== 'hero');

/** Barre du haut façon interface de jeu. */
export function Navbar() {
  const active = useAppStore((s) => s.activeIndex);
  const setMenuOpen = useAppStore((s) => s.setMenuOpen);
  const clicks = useRef<number[]>([]);
  const level = SECTIONS[active];

  const onLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget('hero');
    // Easter egg : 5 clics rapides sur le logo.
    const now = performance.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 2500), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      const st = useAppStore.getState();
      st.unlock('spam');
      st.triggerMatrix(4000);
      st.glitch();
      runtime.explode = 1;
      sfx.glitch();
    }
  };

  return (
    <header className="hud-top">
      <a
        href="#hero"
        className="hud-logo"
        onClick={onLogo}
        data-cursor="HOME"
        aria-label={`${handle} — retour au début`}
      >
        <span className="hud-logo__mark" aria-hidden="true">
          ◢◤
        </span>
        <GlitchText
          text={handle}
          auto={false}
          hover
          className="font-display font-bold tracking-[0.18em] text-sm"
        />
      </a>

      <div className="hud-level" aria-hidden="true">
        <span className="micro micro-accent">LVL {level.num}</span>
        <span className="hud-level__sep">—</span>
        <ScrambleText text={level.title} className="hud-level__name" />
      </div>

      <nav className="hud-nav" aria-label="Navigation principale">
        <ul>
          {NAV.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={SECTIONS[active].id === s.id ? 'is-active' : ''}
                aria-current={SECTIONS[active].id === s.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  sfx.blip();
                  scrollToTarget(s.id);
                }}
                onPointerEnter={() => sfx.hover()}
              >
                <ScrambleText text={s.nav} trigger="hover" duration={0.4} />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hud-controls">
        <SoundToggle />
        <div className="hidden xl:block">
          <QualityToggle />
        </div>
        <div className="xl:hidden hidden sm:block">
          <QualityToggle compact />
        </div>
        <button
          type="button"
          className="hud-btn hud-burger"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu pause"
          aria-haspopup="dialog"
        >
          <Menu size={18} aria-hidden="true" />
          <span className="font-mono text-[0.65rem] tracking-widest">PAUSE</span>
        </button>
      </div>
    </header>
  );
}
