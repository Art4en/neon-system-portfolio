import { useRef } from 'react';
import { content } from '../../content/portfolio';
import { isFilled, isTodo } from '../../content/placeholder';
import { cvUrl, fullName, handle, hasHandle } from '../../lib/content';
import { useAppStore } from '../../store/useAppStore';
import { scrollToTarget } from '../../lib/scroll';
import { gsap, useGSAP } from '../../lib/gsap';
import { Placeholder } from '../ui/Placeholder';
import { Typewriter } from '../ui/Typewriter';
import { MagneticButton } from '../ui/MagneticButton';
import { HeroTitle } from './HeroTitle';

/** 01 — START : nom géant décrypté, rôle tapé au terminal, accroches qui tournent. */
export function Hero() {
  const { identity } = content;
  const playing = useAppStore((s) => s.phase === 'playing');
  const root = useRef<HTMLElement>(null);

  // Titre affiché : pseudo, sinon nom complet, sinon pseudo générique.
  const title = hasHandle ? handle : fullName || handle;
  const taglines = identity.taglines.filter((t) => isFilled(t));
  const firstTodoTagline = identity.taglines.find((t) => isTodo(t));

  useGSAP(
    () => {
      if (!playing) return;
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrée : les éléments secondaires arrivent en cascade après le décryptage du nom.
        gsap.from('[data-hero-in]', {
          y: 30,
          opacity: 0,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          delay: 0.55,
        });
        // Sortie au scroll : le bloc s'éloigne pendant que la caméra avance.
        gsap.to('[data-hero-fade]', {
          yPercent: -30,
          opacity: 0,
          ease: 'power2.in',
          scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [playing] },
  );

  return (
    <section ref={root} id="hero" className="hero" aria-label="Accueil">
      <div className="hero__hud" aria-hidden="true">
        <span className="micro">[SYS.OK] NEON//SYSTEM v2.0</span>
        <span className="micro hidden sm:inline">ID: 0x3F2A · SECTOR 01</span>
      </div>

      <div className="hero__inner">
        <div data-hero-fade="">
          <p className="micro mb-5 flex flex-wrap items-center gap-x-3 gap-y-2" data-hero-in="">
            <span className="micro-accent">▸ PLAYER_ONE</span>
            {hasHandle && fullName ? <span>{fullName}</span> : null}
            {!hasHandle && <Placeholder value={identity.gamertag} field="identity.gamertag" />}
          </p>

          <HeroTitle text={title} start={playing} />

          <p className="hero__role" data-hero-in="">
            <span className="text-accent" aria-hidden="true">
              &gt;{' '}
            </span>
            {isFilled(identity.role) ? (
              <Typewriter lines={[identity.role]} start={playing} sound />
            ) : (
              <Placeholder value={identity.role} field="identity.role" />
            )}
          </p>

          <p className="hero__tagline" data-hero-in="">
            {taglines.length > 0 ? (
              <Typewriter lines={taglines} start={playing} caret={false} typeSpeed={34} />
            ) : (
              <Placeholder value={firstTodoTagline ?? ''} field="identity.taglines" />
            )}
          </p>

          <div className="hero__ctas" data-hero-in="">
            <MagneticButton onClick={() => scrollToTarget('projects')} cursor="PLAY">
              <span aria-hidden="true">▶</span> Start game
            </MagneticButton>
            <MagneticButton
              className="btn-neon btn-neon--alt"
              href={cvUrl ?? undefined}
              download={cvUrl ? true : undefined}
              disabled={!cvUrl}
              cursor="SAVE"
              title={cvUrl ? 'Télécharger mon CV (PDF)' : 'CV bientôt disponible'}
            >
              <span aria-hidden="true">⬇</span> {cvUrl ? 'Download CV' : 'CV · Bientôt disponible'}
            </MagneticButton>
          </div>

          <p className="hero__status" data-hero-in="">
            <span className="hero__dot" aria-hidden="true" />
            <Placeholder value={identity.status} field="identity.status" />
          </p>
        </div>
      </div>

      <a
        href="#about"
        className="scroll-hint"
        onClick={(e) => {
          e.preventDefault();
          scrollToTarget('about');
        }}
        data-cursor="SCROLL"
        data-hero-fade=""
      >
        <span className="scroll-hint__mouse" aria-hidden="true">
          <span className="scroll-hint__wheel" />
        </span>
        <span className="scroll-hint__chevrons" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="micro">Scroll to continue</span>
      </a>
    </section>
  );
}
