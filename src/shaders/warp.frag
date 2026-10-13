uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying vec2 vUv;
varying float vFade;
varying float vPick;

void main() {
  float across = 1.0 - abs(vUv.x * 2.0 - 1.0);
  float along = pow(vUv.y, 2.2); // queue transparente → tête brillante
  vec3 col = vPick < 0.6 ? uColorA : vPick < 0.9 ? uColorB : vec3(1.0);
  float a = across * along * vFade * uOpacity;
  gl_FragColor = vec4(col * a * 1.6, a);
}
