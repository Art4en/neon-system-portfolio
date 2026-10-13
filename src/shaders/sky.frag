// Ciel : noir bleuté en haut, lueur violette / magenta à l'horizon.
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform float uGlowStrength;

varying vec3 vDir;

void main() {
  float h = normalize(vDir).y;
  vec3 col = mix(uHorizon, uZenith, smoothstep(-0.05, 0.42, h));
  col += uGlow * exp(-abs(h - 0.01) * 14.0) * uGlowStrength;
  gl_FragColor = vec4(col, 1.0);
}
