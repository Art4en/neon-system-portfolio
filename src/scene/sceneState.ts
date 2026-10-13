import { Vector3 } from 'three';
import { LEVELS, shapeCenters } from './levels';

/**
 * État partagé de la scène, recalculé une fois par frame par CameraRig (premier useFrame),
 * puis lu par tous les autres objets 3D. Évite de refaire les mêmes calculs partout.
 */
export const sceneState = {
  time: 0,
  dt: 0,
  /** Niveau continu (0 → 6), lissé. */
  level: 0,
  /** Poids de visibilité de chaque niveau (1 = niveau courant, 0 = loin). */
  w: [1, 0, 0, 0, 0, 0, 0],
  /** Distance parcourue par le terrain (défilement). */
  travel: 0,
  /** Défilement du tunnel hyperespace. */
  warp: 0,
  /** Angle de l'hélice (lié au scroll). */
  helix: 0,
  /** Vitesse de scroll lissée. */
  speed: 0,
  camPos: new Vector3(),
  /** Point visé par la souris dans la scène (avec ressort). */
  mouseWorld: new Vector3(0, -999, 0),
  mouseForce: 0,
  /** 1 = animations normales, faible = prefers-reduced-motion. */
  motion: 1,
  /** Rembobinage en cours. */
  rewind: 0,
  aspect: 1,
  /** Centres monde des 7 formes de particules (mis à jour au redimensionnement). */
  centers: shapeCenters(16 / 9),
};

/** Luminosité de la grille / des montagnes, interpolée entre les niveaux. */
export function gridIntensity() {
  const l = sceneState.level;
  const i0 = Math.min(LEVELS.length - 1, Math.floor(l));
  const i1 = Math.min(LEVELS.length - 1, i0 + 1);
  return LEVELS[i0].grid + (LEVELS[i1].grid - LEVELS[i0].grid) * (l - i0);
}
