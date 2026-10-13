// Soleil rétro : dégradé magenta → jaune, découpé par des bandes horizontales animées
// (de plus en plus épaisses vers le bas), avec un halo.
uniform float uTime;
uniform vec3 uTop;
uniform vec3 uBottom;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float R = 0.58;
  float disc = 1.0 - smoothstep(R - 0.006, R + 0.006, r);

  vec3 col = mix(uBottom, uTop, smoothstep(-R, R * 0.9, p.y));

  // Bandes : uniquement sous ~0.15, épaisseur croissante vers le bas, défilement lent.
  float y = p.y;
  float stripe = fract((y + uTime * 0.035) * 13.0);
  float gap = clamp((0.15 - y) / (R + 0.15), 0.0, 1.0) * 0.62;
  float cut = y < 0.15 ? step(gap, stripe) : 1.0;

  // halo, ramené à zéro avant le bord du plan (sinon on devine le carré)
  float halo = exp(-max(r - R, 0.0) * 7.0) * (1.0 - disc) * 0.55 * (1.0 - smoothstep(0.8, 0.98, r));
  vec3 c = col * disc * cut * 1.25 + mix(uBottom, uTop, 0.35) * halo;
  gl_FragColor = vec4(c * uOpacity, 1.0);
}
