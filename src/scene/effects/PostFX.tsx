import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  Scanline,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction, type ChromaticAberrationEffect } from 'postprocessing';
import type { QualityPreset } from '../quality';
import { sceneState } from '../sceneState';
import { useAppStore } from '../../store/useAppStore';
import { prefersReducedMotion } from '../../lib/env';

/**
 * Post-processing : bloom sur le néon, aberration chromatique pilotée par la vitesse du scroll,
 * « glitch » bref aux changements de section (pic de séparation RGB qui tremble), grain,
 * vignette, scanlines. Chaque effet dépend du niveau de qualité.
 *
 * Note : on n'utilise volontairement PAS le GlitchEffect de postprocessing, qui produit des
 * bandes / écrans noirs sur certains GPU.
 */
export function PostFX({ preset }: { preset: QualityPreset }) {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const glitchUntil = useRef(0);
  const glitchTick = useAppStore((s) => s.glitchTick);

  useEffect(() => {
    if (glitchTick > 0 && !prefersReducedMotion()) glitchUntil.current = performance.now() + 280;
  }, [glitchTick]);

  useFrame(() => {
    if (!ca.current) return;
    const base = preset.chromatic
      ? 0.0005 + Math.min(1.2, sceneState.speed) * 0.0022 + sceneState.rewind * 0.005
      : 0;
    // Pic de glitch : séparation RGB qui saute d'une image à l'autre, ~0,3 s.
    const left = glitchUntil.current - performance.now();
    const pulse =
      preset.glitch && left > 0 ? (left / 280) * 0.012 * (Math.random() > 0.5 ? 1 : -1) : 0;
    ca.current.offset.set(base + pulse, base * 0.55 - pulse * 0.4);
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
      {(preset.chromatic || preset.glitch) && (
        <ChromaticAberration ref={ca} radialModulation modulationOffset={0.15} />
      )}
      {preset.scanlines && (
        <Scanline density={1.6} opacity={0.08} blendFunction={BlendFunction.OVERLAY} />
      )}
      {preset.noise && <Noise premultiply opacity={0.35} blendFunction={BlendFunction.SCREEN} />}
      <Vignette offset={0.28} darkness={0.72} />
    </EffectComposer>
  );
}
