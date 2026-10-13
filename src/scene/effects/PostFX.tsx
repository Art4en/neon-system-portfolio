import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Glitch,
  Noise,
  Scanline,
  Vignette,
} from '@react-three/postprocessing';
import {
  BlendFunction,
  GlitchMode,
  type ChromaticAberrationEffect,
  type GlitchEffect,
} from 'postprocessing';
import { Vector2 } from 'three';
import type { QualityPreset } from '../quality';
import { sceneState } from '../sceneState';
import { useAppStore } from '../../store/useAppStore';
import { prefersReducedMotion } from '../../lib/env';

const GLITCH_DELAY = new Vector2(3600, 3600); // jamais de glitch « spontané » : on le pilote nous-mêmes
const GLITCH_DURATION = new Vector2(0.2, 0.35);
const GLITCH_STRENGTH = new Vector2(0.15, 0.45);

/**
 * Post-processing : bloom sur le néon, aberration chromatique pilotée par la vitesse du scroll,
 * glitch bref aux changements de section / scrolls très rapides, grain, vignette, scanlines.
 * Chaque effet dépend du niveau de qualité.
 */
export function PostFX({ preset }: { preset: QualityPreset }) {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const glitch = useRef<GlitchEffect>(null);
  const glitchUntil = useRef(0);
  const glitchTick = useAppStore((s) => s.glitchTick);

  useEffect(() => {
    if (glitchTick > 0 && !prefersReducedMotion()) glitchUntil.current = performance.now() + 260;
  }, [glitchTick]);

  useFrame(() => {
    if (ca.current) {
      const k = 0.0005 + Math.min(1.4, sceneState.speed) * 0.0032 + sceneState.rewind * 0.006;
      ca.current.offset.set(k, k * 0.55);
    }
    if (glitch.current) {
      const on =
        performance.now() < glitchUntil.current ||
        sceneState.rewind > 0.5 ||
        (sceneState.speed > 1.35 && sceneState.motion === 1);
      const mode = on ? GlitchMode.CONSTANT_WILD : GlitchMode.DISABLED;
      if (glitch.current.mode !== mode) glitch.current.mode = mode;
    }
  });

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {preset.bloom && (
        <Bloom
          mipmapBlur
          intensity={0.95}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.3}
          radius={0.7}
        />
      )}
      {preset.chromatic && (
        <ChromaticAberration ref={ca} radialModulation modulationOffset={0.15} />
      )}
      {preset.glitch && (
        <Glitch
          ref={glitch}
          active
          mode={GlitchMode.DISABLED}
          delay={GLITCH_DELAY}
          duration={GLITCH_DURATION}
          strength={GLITCH_STRENGTH}
          ratio={0.9}
        />
      )}
      {preset.scanlines && (
        <Scanline density={1.6} opacity={0.08} blendFunction={BlendFunction.OVERLAY} />
      )}
      {preset.noise && <Noise premultiply opacity={0.35} blendFunction={BlendFunction.SCREEN} />}
      <Vignette offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
}
