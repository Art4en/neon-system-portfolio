/**
 * État « runtime » mutable, lu à chaque frame par la scène 3D et le HUD.
 * Volontairement HORS de React/zustand : ces valeurs changent 60 fois par seconde
 * et ne doivent provoquer aucun re-render.
 */
export const runtime = {
  /** Scroll courant (px) et maximum. */
  scroll: 0,
  maxScroll: 1,
  /** Progression globale du scroll (0 → 1). */
  progress: 0,
  /** Vitesse brute de Lenis (px / frame, signée). */
  velocity: 0,
  /** Vitesse lissée et normalisée (0 → ~1, valeur absolue). */
  speed: 0,
  /** Niveau continu (0 = Hero … 6 = Contact), interpolé entre les sections. */
  level: 0,
  /** Souris : position en px, normalisée (-1 → 1), et présence. */
  mouse: { x: -9999, y: -9999, nx: 0, ny: 0, active: false },
  /** FPS mesurés (moyenne glissante). */
  fps: 60,
  /** Impulsion d'explosion des particules (God Mode), décroît toute seule. */
  explode: 0,
  /** Plongée de caméra après PRESS START (0 → 1). */
  intro: 0,
};

export type Runtime = typeof runtime;
