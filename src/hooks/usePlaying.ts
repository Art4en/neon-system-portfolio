import { useAppStore } from '../store/useAppStore';

/**
 * true une fois que le joueur a appuyé sur START (ou au retour dans la même session).
 * Les animations GSAP ne sont créées qu'à partir de là : pendant le boot, la page est
 * masquée et le thread principal reste libre pour le chargement de la scène 3D.
 */
export function usePlaying(): boolean {
  return useAppStore((s) => s.phase === 'playing');
}
