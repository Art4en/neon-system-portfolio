// Étoiles qui scintillent (fréquence et phase propres à chaque étoile).
attribute vec2 aStar; // x : phase · y : taille
uniform float uTime;
uniform float uPixelRatio;

varying float vAlpha;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aStar.x * 2.5) + aStar.x * 60.0);
  vAlpha = tw * smoothstep(0.0, 0.25, normalize(position).y);
  gl_PointSize = (1.0 + aStar.y * 2.4) * uPixelRatio;
}
