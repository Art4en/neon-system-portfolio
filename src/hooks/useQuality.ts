import { useAppStore } from '../store/useAppStore';
import { QUALITY_PRESETS } from '../scene/quality';

/** Niveau de qualité courant + son preset (nombre de particules, effets, DPR…). */
export function useQuality() {
  const quality = useAppStore((s) => s.quality);
  const auto = useAppStore((s) => s.qualityAuto);
  const setQuality = useAppStore((s) => s.setQuality);
  return { quality, auto, preset: QUALITY_PRESETS[quality], setQuality };
}
