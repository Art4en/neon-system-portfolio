/**
 * Générateurs de positions pour les formes des particules.
 * Toutes les formes sont en coordonnées LOCALES (centrées sur 0) ; le shader ajoute
 * le centre de chaque forme (uOffsets), sauf la grille qui est déjà en coordonnées monde.
 */
import { seededRandom } from '../../lib/pixelFont';

export type Rand = () => number;

const TAU = Math.PI * 2;
/** Gaussienne approximative (somme de 3 uniformes). */
const gauss = (r: Rand) => (r() + r() + r() - 1.5) / 1.5;

/** 0 — Champ de données au-dessus de la grille du Hero (dense au centre, quelques points en l'air). */
export function gridShape(n: number, r: Rand): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const spread = r() < 0.65 ? 16 : 40;
    a[i * 3] = (r() * 2 - 1) * spread;
    a[i * 3 + 1] = r() < 0.85 ? 0.08 + r() * 0.45 : 0.6 + r() * 6;
    a[i * 3 + 2] = -90 + r() * 96;
  }
  return a;
}

/** 1 — Sphère holographique : surface (Fibonacci) + anneaux de latitude + cœur. */
export function sphereShape(n: number, r: Rand, radius = 2.3): Float32Array {
  const a = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const k = r();
    let x: number, y: number, z: number;
    if (k < 0.62) {
      const yy = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - yy * yy);
      const th = golden * i;
      x = Math.cos(th) * rad;
      y = yy;
      z = Math.sin(th) * rad;
    } else if (k < 0.85) {
      // anneaux de latitude → effet globe filaire
      const lat = (Math.floor(r() * 9) - 4) * (Math.PI / 10);
      const th = r() * TAU;
      x = Math.cos(th) * Math.cos(lat);
      y = Math.sin(lat);
      z = Math.sin(th) * Math.cos(lat);
    } else {
      const th = r() * TAU;
      const ph = Math.acos(2 * r() - 1);
      const rr = Math.pow(r(), 0.6) * 0.55;
      x = Math.sin(ph) * Math.cos(th) * rr;
      y = Math.cos(ph) * rr;
      z = Math.sin(ph) * Math.sin(th) * rr;
    }
    a[i * 3] = x * radius;
    a[i * 3 + 1] = y * radius;
    a[i * 3 + 2] = z * radius;
  }
  return a;
}

export const PLEXUS_MAX_NODES = 120;

/** Nœuds du réseau neuronal (partagés avec Plexus.tsx, toujours les mêmes grâce à la graine). */
export function plexusNodes(): Float32Array {
  const r = seededRandom('neon-plexus');
  const a = new Float32Array(PLEXUS_MAX_NODES * 3);
  for (let i = 0; i < PLEXUS_MAX_NODES; i++) {
    a[i * 3] = (r() * 2 - 1) * 10;
    a[i * 3 + 1] = (r() * 2 - 1) * 4.6;
    a[i * 3 + 2] = (r() * 2 - 1) * 3;
  }
  return a;
}

/** 2 — Constellation : amas autour des nœuds + poussière le long des liaisons proches. */
export function plexusShape(n: number, r: Rand, nodes: Float32Array): Float32Array {
  const a = new Float32Array(n * 3);
  const count = nodes.length / 3;
  const pairs: [number, number][] = [];
  for (let i = 0; i < count; i++)
    for (let j = i + 1; j < count; j++) {
      const dx = nodes[i * 3] - nodes[j * 3];
      const dy = nodes[i * 3 + 1] - nodes[j * 3 + 1];
      const dz = nodes[i * 3 + 2] - nodes[j * 3 + 2];
      if (dx * dx + dy * dy + dz * dz < 3.4 * 3.4) pairs.push([i, j]);
    }
  for (let i = 0; i < n; i++) {
    if (r() < 0.55 || pairs.length === 0) {
      const k = Math.floor(r() * count);
      a[i * 3] = nodes[k * 3] + gauss(r) * 0.32;
      a[i * 3 + 1] = nodes[k * 3 + 1] + gauss(r) * 0.32;
      a[i * 3 + 2] = nodes[k * 3 + 2] + gauss(r) * 0.32;
    } else {
      const [p, q] = pairs[Math.floor(r() * pairs.length)];
      const t = r();
      for (let c = 0; c < 3; c++)
        a[i * 3 + c] =
          nodes[p * 3 + c] + (nodes[q * 3 + c] - nodes[p * 3 + c]) * t + gauss(r) * 0.04;
    }
  }
  return a;
}

/** 3 — Tunnel : cylindre autour de l'axe Z (la caméra est dedans). */
export function tunnelShape(n: number, r: Rand): Float32Array {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = r() * TAU;
    const rad = 3.6 + Math.pow(r(), 2) * 6;
    a[i * 3] = Math.cos(th) * rad;
    a[i * 3 + 1] = Math.sin(th) * rad;
    a[i * 3 + 2] = -r() * 70;
  }
  return a;
}

/** 4 — Double hélice de données : deux brins, des « barreaux » et un peu de poussière. */
export function helixShape(n: number, r: Rand): Float32Array {
  const a = new Float32Array(n * 3);
  const H = 15;
  const R = 2.4;
  const turns = 4.5;
  const strand = (t: number, phase: number): [number, number, number] => {
    const ang = t * turns * TAU + phase;
    return [Math.cos(ang) * R, (t - 0.5) * H, Math.sin(ang) * R];
  };
  const rungs = Math.round(turns * 9);
  for (let i = 0; i < n; i++) {
    const k = r();
    let p: [number, number, number];
    if (k < 0.8) {
      p = strand(r(), k < 0.4 ? 0 : Math.PI);
      p = [p[0] + gauss(r) * 0.09, p[1] + gauss(r) * 0.09, p[2] + gauss(r) * 0.09];
    } else if (k < 0.93) {
      const t = Math.floor(r() * rungs) / rungs;
      const s = r();
      const pa = strand(t, 0);
      const pb = strand(t, Math.PI);
      p = [pa[0] + (pb[0] - pa[0]) * s, pa[1], pa[2] + (pb[2] - pa[2]) * s];
    } else {
      const th = r() * TAU;
      const rad = R + 0.6 + r() * 2.5;
      p = [Math.cos(th) * rad, (r() - 0.5) * H * 1.1, Math.sin(th) * rad];
    }
    a.set(p, i * 3);
  }
  return a;
}

/** 6 — Vortex : tore de particules + bras en spirale qui plongent vers le centre. */
export function vortexShape(n: number, r: Rand): Float32Array {
  const a = new Float32Array(n * 3);
  const R = 4.2;
  for (let i = 0; i < n; i++) {
    if (r() < 0.68) {
      const u = r() * TAU;
      const v = r() * TAU;
      const tube = Math.pow(r(), 1.4) * 1.45;
      const rr = R + Math.cos(v) * tube;
      a[i * 3] = Math.cos(u) * rr;
      a[i * 3 + 1] = Math.sin(u) * rr;
      a[i * 3 + 2] = Math.sin(v) * tube * 0.6;
    } else {
      const arm = Math.floor(r() * 3);
      const t = r();
      const ang = t * 3.2 * Math.PI + (arm * TAU) / 3;
      const rad = R * (1 - Math.pow(t, 0.8)) + gauss(r) * 0.12;
      a[i * 3] = Math.cos(ang) * rad;
      a[i * 3 + 1] = Math.sin(ang) * rad;
      a[i * 3 + 2] = -t * 3.5;
    }
  }
  return a;
}

/** Valeurs aléatoires par particule : délai, couleur, taille, phase. */
export function randomAttr(n: number, r: Rand): Float32Array {
  const a = new Float32Array(n * 4);
  for (let i = 0; i < n * 4; i++) a[i] = r();
  return a;
}

export { textToPoints } from './textToPoints';
