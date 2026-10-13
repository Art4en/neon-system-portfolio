import { useEffect } from 'react';
import { initScroll } from '../lib/scroll';
import { useAppStore } from '../store/useAppStore';

/**
 * Initialise Lenis + ScrollTrigger (un seul RAF via gsap.ticker) et renvoie la progression
 * arrondie (0-100). Les valeurs fines (vitesse, niveau continu…) sont dans `runtime`.
 */
export function useScrollProgress(): number {
  useEffect(() => initScroll(), []);
  return useAppStore((s) => s.xp);
}
