import { lazy, startTransition, Suspense, useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { runtime } from './store/runtime';
import { useScrollProgress } from './hooks/useScrollProgress';
import { useMouse } from './hooks/useMouse';
import { useKonami } from './hooks/useKonami';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useReveals } from './hooks/useReveals';
import { hasWebGL, prefersReducedMotion } from './lib/env';
import { readStorage, writeStorage } from './lib/storage';
import { gsap, ScrollTrigger } from './lib/gsap';
import { sfx } from './audio/synth';
import { BootSequence } from './components/boot/BootSequence';
import { Navbar } from './components/hud/Navbar';
import { XPBar } from './components/hud/XPBar';
import { MiniMap } from './components/hud/MiniMap';
import { HudWidget } from './components/hud/HudWidget';
import { PauseMenu } from './components/hud/PauseMenu';
import { LevelTransition } from './components/hud/LevelTransition';
import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { Timeline } from './components/sections/Timeline';
import { Terminal } from './components/sections/Terminal';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/sections/Footer';
import { ToastStack } from './components/ui/Toast';
import { CustomCursor } from './components/cursor/CustomCursor';
import { MatrixRain } from './components/layers/MatrixRain';
import { Spotlight } from './components/layers/Spotlight';
import { NoWebGLFallback } from './components/layers/NoWebGLFallback';

// Chargés à la demande (code splitting) : la scène 3D, les modales et le mini-jeu.
const Experience = lazy(() => import('./scene/Experience'));
const ProjectBriefing = lazy(() => import('./components/sections/ProjectBriefing'));
const SnakeGame = lazy(() => import('./components/game/SnakeGame'));

/** Lance la partie : phase « playing » + plongée de caméra dans le paysage. */
function startGame(fast = false) {
  const st = useAppStore.getState();
  if (st.phase === 'playing') return;
  writeStorage('neon.booted', true, 'session');
  st.setPhase('playing');
  st.glitch();
  gsap.to(runtime, {
    intro: 1,
    duration: prefersReducedMotion() ? 0 : fast ? 1.4 : 2.6,
    ease: 'none',
  });
  // Laisse le DOM du Hero se mettre en place, puis recalcule les déclencheurs de scroll.
  window.setTimeout(() => ScrollTrigger.refresh(), 100);
}

export default function App() {
  useScrollProgress();
  useMouse();
  useReveals();
  const phase = useAppStore((s) => s.phase);
  const openProject = useAppStore((s) => s.openProject);
  const gameOpen = useAppStore((s) => s.gameOpen);
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = useReducedMotion();
  // La séquence de boot complète ne se joue qu'une fois par session.
  const [showBoot, setShowBoot] = useState(() => !readStorage('neon.booted', false, 'session'));

  useEffect(() => {
    if (!showBoot) startGame(true);
  }, [showBoot]);

  // Les sections sous le Hero sont rendues dans une transition : React découpe le travail
  // en petits morceaux et le thread principal reste disponible pendant le boot.
  const [rest, setRest] = useState(false);
  useEffect(() => {
    startTransition(() => setRest(true));
  }, []);

  useKonami(
    () => {
      const st = useAppStore.getState();
      const on = !st.godMode;
      st.setGodMode(on);
      st.glitch();
      sfx.glitch();
      if (on) {
        runtime.explode = 1;
        st.triggerMatrix(5000);
        if (st.achievements.includes('konami'))
          st.pushToast({ kind: 'secret', title: 'GOD MODE ON', subtitle: 'Konami code accepté' });
        st.unlock('konami');
      } else
        st.pushToast({ kind: 'system', title: 'GOD MODE OFF', subtitle: 'Retour à la normale' });
    },
    (word) => {
      if (word !== 'matrix') return;
      const st = useAppStore.getState();
      st.triggerMatrix(7000);
      st.glitch();
      st.unlock('neo');
    },
  );

  // Animations CSS des sections hors écran mises en pause (économie GPU / batterie).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => ((e.target as HTMLElement).dataset.offscreen = e.isIntersecting ? '' : '1'),
        ),
      { rootMargin: '200px 0px' },
    );
    document.querySelectorAll('main > section, footer').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [rest]);

  return (
    <>
      <a href="#main" className="skip-link">
        Aller au contenu
      </a>

      {/* ── Fond : scène 3D (ou repli CSS), pluie de code, spotlight, CRT ── */}
      <div className="bg-layer" aria-hidden="true">
        {hasWebGL ? (
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        ) : (
          <NoWebGLFallback />
        )}
      </div>
      <MatrixRain />
      <Spotlight />
      <div className="crt-overlay" aria-hidden="true" />

      {/* ── HUD ── */}
      <Navbar />
      <XPBar />
      <MiniMap />
      <HudWidget />

      <main id="main" tabIndex={-1}>
        <Hero />
        {rest && (
          <>
            <About />
            <Skills />
            <Projects />
            <Timeline />
            <Terminal />
            <Contact />
          </>
        )}
      </main>
      {rest && <Footer />}

      <LevelTransition />
      <ToastStack />
      <PauseMenu />
      {openProject && (
        <Suspense fallback={null}>
          <ProjectBriefing key={openProject} />
        </Suspense>
      )}
      {gameOpen && (
        <Suspense fallback={null}>
          <SnakeGame />
        </Suspense>
      )}
      {finePointer && !reduced && <CustomCursor />}
      {showBoot && phase === 'boot' && <BootSequence onStart={() => startGame()} />}
      {showBoot && phase === 'playing' && <BootExit onDone={() => setShowBoot(false)} />}
    </>
  );
}

/** Laisse jouer l'animation de sortie du boot (flash + glitch) avant de le démonter. */
function BootExit({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 900);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return (
    <div className="boot is-leaving" aria-hidden="true">
      <div className="boot__flash" />
    </div>
  );
}
