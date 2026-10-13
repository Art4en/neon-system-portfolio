import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  HalfFloatType,
  WebGLRenderTarget,
  type Camera,
  type Object3D,
  type Scene,
  type WebGLRenderer,
} from 'three';
// Import ciblé : évite d'embarquer l'index complet de drei.
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import { gsap } from '../lib/gsap';
import { QUALITIES, useAppStore } from '../store/useAppStore';
import { isMobileViewport } from '../lib/env';
import { QUALITY_PRESETS } from './quality';
import { CameraRig } from './CameraRig';
import { Sky } from './Sky';
import { RetroSun } from './RetroSun';
import { SynthwaveGrid } from './SynthwaveGrid';
import { Mountains } from './Mountains';
import { Particles } from './Particles';
import { Plexus } from './Plexus';
import { WarpTunnel } from './WarpTunnel';
import { Portal } from './Portal';
import { PostFX } from './effects/PostFX';
import { COLORS } from './palette';

/**
 * Tant que les shaders compilent en parallèle (KHR_parallel_shader_compile), on ne rend aucune
 * image : un rendu prématuré forcerait le navigateur à attendre la compilation sur le thread
 * principal (plusieurs centaines de ms de blocage).
 */
const compileGate = { ready: false };

/**
 * Compile en arrière-plan (KHR_parallel_shader_compile) TOUS les shaders de la scène pour une
 * cible de rendu donnée — y compris les objets encore invisibles (tunnel, plexus, portail…).
 * Sans ça, three.js compile ces shaders au moment où l'objet apparaît : à-coup en plein scroll.
 * `target` : null = rendu direct à l'écran ; une render target = rendu via le post-processing
 * (les shaders y sont compilés avec un autre espace colorimétrique, donc en double).
 */
async function prewarm(
  gl: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  target: WebGLRenderTarget | null,
) {
  const hidden: Object3D[] = [];
  scene.traverse((o) => {
    if (!o.visible) {
      hidden.push(o);
      o.visible = true;
    }
  });
  const previous = gl.getRenderTarget();
  let pending: Promise<unknown>;
  try {
    gl.setRenderTarget(target);
    // compileAsync crée les programmes immédiatement puis attend leur fin de compilation.
    pending = gl.compileAsync
      ? gl.compileAsync(scene, camera)
      : Promise.resolve(gl.compile(scene, camera));
  } catch {
    pending = Promise.resolve();
  } finally {
    gl.setRenderTarget(previous);
    hidden.forEach((o) => (o.visible = false));
  }
  await pending.catch(() => undefined);
}

/**
 * Un seul RAF : la scène n'a pas sa propre boucle (frameloop="never"),
 * elle est avancée depuis gsap.ticker, comme Lenis et ScrollTrigger.
 * L'onglet caché → requestAnimationFrame s'arrête → la scène est en pause.
 */
function TickerDriver() {
  const advance = useThree((s) => s.advance);
  useEffect(() => {
    const tick = () => {
      if (compileGate.ready) advance(performance.now() / 1000);
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance]);
  return null;
}

/** Signale au boot que les shaders sont compilés et que la première image est rendue. */
function ReadySignal() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let cancelled = false;
    void prewarm(gl, scene, camera, null).then(() => {
      if (cancelled) return;
      compileGate.ready = true;
      requestAnimationFrame(() => useAppStore.getState().setSceneReady());
    });
    return () => {
      cancelled = true;
    };
  }, [gl, scene, camera]);
  return null;
}

/**
 * Qualité automatique :
 * 1. point de départ selon l'appareil (mobile → medium, sinon high) ;
 * 2. mesure des FPS en continu (PerformanceMonitor) : on baisse si ça rame, on remonte si c'est fluide.
 * Dès que l'utilisateur choisit une qualité à la main, on n'y touche plus.
 */
function AutoQuality() {
  const flips = useRef(0);
  const step = (dir: 1 | -1) => {
    const { quality, qualityAuto, setQuality } = useAppStore.getState();
    if (!qualityAuto || flips.current > 6) return;
    const i = QUALITIES.indexOf(quality) + dir;
    // On ne monte jamais en ULTRA automatiquement (choix manuel uniquement).
    if (i < 0 || i >= QUALITIES.length - (dir > 0 ? 1 : 0)) return;
    flips.current++;
    setQuality(QUALITIES[i]);
  };
  return (
    <PerformanceMonitor
      ms={250}
      iterations={8}
      bounds={(refresh) => (refresh > 90 ? [55, 85] : [45, 58])}
      onDecline={() => step(-1)}
      onIncline={() => step(1)}
    />
  );
}

/**
 * Le post-processing (bloom, aberration, glitch…) demande ~0,5-1 s de compilation de shaders
 * qui ne peut pas se faire en parallèle. On le monte donc à la première interaction
 * (souris, clavier, START) ou, à défaut, après 8 s : jamais pendant le chargement initial.
 */
function usePostGate(): boolean {
  const sceneReady = useAppStore((s) => s.sceneReady);
  const playing = useAppStore((s) => s.phase === 'playing');
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (armed) return;
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    const arm = () => setArmed(true);
    events.forEach((e) => window.addEventListener(e, arm, { once: true, passive: true }));
    const timer = window.setTimeout(arm, 8000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, arm));
      window.clearTimeout(timer);
    };
  }, [armed]);
  return sceneReady && (armed || playing);
}

/** Monte le post-processing une fois ses variantes de shaders préchauffées en arrière-plan. */
function PostGate({ preset }: { preset: (typeof QUALITY_PRESETS)[keyof typeof QUALITY_PRESETS] }) {
  const armed = usePostGate();
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (!armed || warm || !preset.post) return;
    let cancelled = false;
    const rt = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
    void prewarm(gl, scene, camera, rt).then(() => {
      rt.dispose();
      if (!cancelled) setWarm(true);
    });
    return () => {
      cancelled = true;
    };
  }, [armed, warm, preset.post, gl, scene, camera]);
  return preset.post && warm ? <PostFX preset={preset} /> : null;
}

export default function Experience() {
  const quality = useAppStore((s) => s.quality);
  const preset = QUALITY_PRESETS[quality];

  useEffect(() => {
    document.documentElement.dataset.quality = quality;
  }, [quality]);

  useEffect(() => {
    const st = useAppStore.getState();
    if (st.qualityAuto && isMobileViewport() && st.quality !== 'low') st.setQuality('medium');
  }, []);

  return (
    <Canvas
      className="scene-canvas"
      frameloop="never"
      dpr={preset.dpr}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 55, near: 0.1, far: 420, position: [0, 16, 26] }}
      onCreated={(state) => {
        state.gl.setClearColor(COLORS.bg);
        // En production, pas de vérification synchrone des erreurs de shader (coûteuse).
        state.gl.debug.checkShaderErrors = import.meta.env.DEV;
        if (import.meta.env.DEV) (window as unknown as { __three: unknown }).__three = state;
      }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <TickerDriver />
      <AutoQuality />
      <CameraRig />
      <Suspense fallback={null}>
        <Sky stars={preset.stars} />
        <RetroSun />
        <SynthwaveGrid />
        <Mountains density={preset.terrain} />
        <WarpTunnel count={preset.warp} />
        <Plexus count={preset.plexus} />
        <Portal />
        <Particles count={preset.particles} />
        <PostGate preset={preset} />
      </Suspense>
      <ReadySignal />
    </Canvas>
  );
}
