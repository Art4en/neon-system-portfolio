// Portail / vortex : bras en spirale déformés par du bruit (distorsion), anneau lumineux,
// cœur éclatant. Rendu en blending additif.
#include ./chunks/noise.glsl

uniform float uTime;
uniform float uOpacity;
uniform vec3 uRing;   // accent
uniform vec3 uArmA;   // magenta
uniform vec3 uArmB;   // violet

varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float a = atan(p.y, p.x + 1e-6); // jamais atan(0, 0)
  float swirl = a + r * 7.0 - uTime * 1.3;
  float n = snoise(vec3(cos(swirl) * r * 2.2, sin(swirl) * r * 2.2, uTime * 0.25));
  float arms = 0.5 + 0.5 * sin(swirl * 3.0 + n * 2.5);
  arms = pow(arms, 2.0);
  float ring = exp(-abs(r - 0.8) * 30.0);
  float core = pow(1.0 - smoothstep(0.0, 0.55, r), 3.0);
  float mask = 1.0 - smoothstep(0.86, 1.0, r);
  vec3 col = mix(uArmB, uArmA, arms) * arms * (1.0 - smoothstep(0.15, 0.95, r)) * 0.9;
  col += uRing * ring * 1.6;
  col += vec3(1.0, 0.95, 1.0) * core * 0.9;
  gl_FragColor = vec4(max(col * mask * uOpacity, vec3(0.0)), 1.0);
}
