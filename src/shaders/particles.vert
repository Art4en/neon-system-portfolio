// ─────────────────────────────────────────────────────────────────────────────
// Particules qui se transforment (morphing) entre 7 formes précalculées.
// `position` = forme 0 (champ de données du Hero), les autres formes sont des attributs.
// Le CPU fournit l'index de la forme de départ (uFrom), d'arrivée (uTo) et la progression
// (uMorph). Chaque particule a son propre délai (aRandom.x) → transition « en nuée ».
// ─────────────────────────────────────────────────────────────────────────────
#include ./chunks/noise.glsl

attribute vec3 aSphere;
attribute vec3 aPlexus;
attribute vec3 aTunnel;
attribute vec3 aHelix;
attribute vec3 aText;
attribute vec3 aVortex;
// x : délai de morphing · y : choix de couleur · z : taille · w : phase
attribute vec4 aRandom;

uniform float uTime;
uniform float uMotion;      // 1 = normal, ~0.15 = prefers-reduced-motion
uniform float uFrom;
uniform float uTo;
uniform float uMorph;
uniform vec3 uOffsets[7];   // centre de chaque forme dans le monde
uniform float uFlow;        // défilement du champ de données (synchro avec la grille)
uniform float uWarp;        // défilement du tunnel hyperespace
uniform float uHelix;       // rotation de l'hélice (liée au scroll)
uniform vec3 uMouse;        // curseur projeté dans la scène (avec ressort → retour élastique)
uniform float uMouseForce;
uniform float uExplode;     // God Mode
uniform float uSize;
uniform float uPixelRatio;
uniform float uSpeed;       // vitesse du scroll lissée (0 → 1.6)
uniform vec3 uColorA;       // accent (cyan par défaut)
uniform vec3 uColorB;       // magenta
uniform vec3 uColorC;       // violet
uniform vec3 uColorD;       // jaune

varying vec3 vColor;
varying float vAlpha;

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

// Position (monde) d'une particule dans la forme n°i, animation propre à la forme incluse.
vec3 shapeAt(float i) {
  float t = uTime * uMotion;
  vec3 p;
  if (i < 0.5) {
    // 0 — champ de données qui flotte au-dessus de la grille et défile vers la caméra
    p = position;
    p.z = mod(p.z + uFlow, 96.0) - 90.0;
    p.y += sin(p.x * 0.35 + p.z * 0.25 + t * 1.2) * 0.18 * aRandom.w;
  } else if (i < 1.5) {
    // 1 — sphère holographique qui « respire »
    p = aSphere * (1.0 + 0.045 * sin(t * 1.4 + aRandom.w * 6.2831));
    p.xz = rot(t * 0.18) * p.xz;
  } else if (i < 2.5) {
    // 2 — constellation / réseau neuronal (les lignes sont dessinées par Plexus.tsx)
    p = aPlexus + 0.08 * vec3(sin(t + aRandom.w * 20.0), cos(t * 1.3 + aRandom.w * 13.0), 0.0);
  } else if (i < 3.5) {
    // 3 — tunnel hyperespace : cylindre qui défile vers la caméra
    p = aTunnel;
    p.z = mod(p.z + uWarp, 70.0) - 70.0;
    p.xy = rot(t * 0.12) * p.xy;
  } else if (i < 4.5) {
    // 4 — double hélice de données qui tourne avec le scroll
    p = aHelix;
    p.xz = rot(uHelix) * p.xz;
  } else if (i < 5.5) {
    // 5 — pseudo du joueur échantillonné depuis un canvas 2D
    p = aText;
    p.z += sin(p.x * 0.45 + t * 1.6) * 0.18;
  } else {
    // 6 — vortex / portail : rotation plus rapide près du centre
    p = aVortex;
    float r = length(p.xy);
    p.xy = rot(t * (1.4 / (0.5 + r * 0.35))) * p.xy;
  }
  return p + uOffsets[int(i + 0.5)];
}

void main() {
  float t = uTime * uMotion;
  vec3 a = shapeAt(uFrom);
  vec3 b = shapeAt(uTo);

  // Délai aléatoire par particule : elles partent et arrivent à des moments différents.
  float m = smoothstep(aRandom.x * 0.45, aRandom.x * 0.45 + 0.55, uMorph);
  vec3 p = mix(a, b, m);

  // Dérive organique permanente + dispersion au milieu du trajet (nuée).
  float mid = sin(m * 3.14159265);
  p += drift(p * 0.14 + t * 0.08) * (0.22 * uMotion + mid * 2.6);

  // God Mode : explosion radiale qui retombe toute seule.
  vec3 center = mix(uOffsets[int(uFrom + 0.5)], uOffsets[int(uTo + 0.5)], m);
  p += normalize(p - center + 1e-4) * uExplode * (2.0 + aRandom.y * 14.0);

  // Répulsion autour du curseur.
  vec3 d = p - uMouse;
  float dist = length(d);
  p += (d / max(dist, 1e-3)) * smoothstep(2.8, 0.0, dist) * uMouseForce * 1.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float depth = -mv.z;
  float size = uSize * (0.55 + aRandom.z * 1.2) * (1.0 + mid * 0.8) * (1.0 + uSpeed * 0.9);
  gl_PointSize = clamp(size * uPixelRatio * (14.0 / depth), 1.0, 30.0 * uPixelRatio);

  vColor = aRandom.y < 0.56 ? uColorA : aRandom.y < 0.8 ? uColorB : aRandom.y < 0.95 ? uColorC : uColorD;
  float twinkle = 0.65 + 0.35 * sin(t * 2.2 + aRandom.w * 40.0);
  vAlpha = twinkle * smoothstep(0.4, 2.5, depth) * smoothstep(140.0, 30.0, depth);
}
