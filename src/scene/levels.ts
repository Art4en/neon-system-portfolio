import { Vector3 } from 'three';

/**
 * Le voyage de la caméra : un point d'ancrage par niveau (section).
 * La caméra avance le long de -Z ; entre deux sections, elle est interpolée selon le scroll.
 */
export interface LevelAnchor {
  cam: Vector3;
  look: Vector3;
  /** Luminosité de la grille / des montagnes à ce niveau. */
  grid: number;
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z);

export const LEVELS: LevelAnchor[] = [
  { cam: v(0, 1.15, 0), look: v(0, 1.95, -30), grid: 1 }, // 0 Hero — paysage synthwave
  { cam: v(0, 4.4, -26), look: v(0, 3.7, -40), grid: 0.6 }, // 1 Profil — la caméra s'élève
  { cam: v(0, 6.6, -60), look: v(0, 6.2, -75), grid: 0.42 }, // 2 Skills — constellation
  { cam: v(0, 6.0, -100), look: v(0, 6.0, -130), grid: 0.18 }, // 3 Missions — hyperespace
  { cam: v(0, 5.6, -140), look: v(0, 5.5, -156), grid: 0.5 }, // 4 Parcours — hélice
  { cam: v(0, 5.6, -175), look: v(0, 6.1, -190), grid: 0.5 }, // 5 Console — pseudo en particules
  { cam: v(0, 5.6, -210), look: v(0, 5.6, -225), grid: 0.6 }, // 6 Contact — portail
];

/** Départ de la plongée de caméra après « PRESS START ». */
export const INTRO_FROM = { cam: v(0, 16, 26), look: v(0, 0, -40) };

/** Centres (monde) des 7 formes de particules, dans l'ordre des niveaux. */
export function shapeCenters(aspect: number): Vector3[] {
  const wide = aspect > 1.15;
  // Sur desktop, la sphère se place à droite de la fiche joueur (≈ 70 % de la largeur).
  const sphereX = wide ? 0.41 * Math.tan((55 / 2) * (Math.PI / 180)) * 8 * aspect : 0;
  return [
    v(0, 0, 0),
    v(sphereX, wide ? 3.95 : 4.4, -34),
    v(0, 6.2, -73),
    v(0, 6.0, -100),
    v(0, 5.5, -152),
    v(0, wide ? 7.6 : 7.4, -192),
    v(0, wide ? 7.9 : 7.2, -224),
  ];
}
