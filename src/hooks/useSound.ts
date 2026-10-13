import { useAppStore } from '../store/useAppStore';
import { sfx } from '../audio/synth';

/** Accès au synthé d'interface + état du son (coupé par défaut). */
export function useSound() {
  const soundOn = useAppStore((s) => s.soundOn);
  const toggle = useAppStore((s) => s.toggleSound);
  return { sfx, soundOn, toggle };
}
