import type { Quality } from '../store/useAppStore';

export interface QualityPreset {
  particles: number;
  dpr: number | [number, number];
  post: boolean;
  bloom: boolean;
  chromatic: boolean;
  glitch: boolean;
  noise: boolean;
  scanlines: boolean;
  stars: number;
  warp: number;
  plexus: number;
  /** Densité du maillage des montagnes (1 = 1 segment par unité). */
  terrain: number;
}

/** LOW : ~5 000 particules, pas de post-processing, DPR 1. ULTRA : 32 000, tous les effets, DPR 2. */
export const QUALITY_PRESETS: Record<Quality, QualityPreset> = {
  low: {
    particles: 5000,
    dpr: 1,
    post: false,
    bloom: false,
    chromatic: false,
    glitch: false,
    noise: false,
    scanlines: false,
    stars: 500,
    warp: 160,
    plexus: 40,
    terrain: 0.5,
  },
  medium: {
    particles: 12000,
    dpr: [1, 1.25],
    post: true,
    bloom: true,
    chromatic: false,
    glitch: true,
    noise: false,
    scanlines: false,
    stars: 900,
    warp: 300,
    plexus: 60,
    terrain: 0.75,
  },
  high: {
    particles: 20000,
    dpr: [1, 1.5],
    post: true,
    bloom: true,
    chromatic: true,
    glitch: true,
    noise: true,
    scanlines: false,
    stars: 1400,
    warp: 460,
    plexus: 80,
    terrain: 1,
  },
  ultra: {
    particles: 32000,
    dpr: [1, 2],
    post: true,
    bloom: true,
    chromatic: true,
    glitch: true,
    noise: true,
    scanlines: true,
    stars: 2200,
    warp: 700,
    plexus: 110,
    terrain: 1.25,
  },
};
