uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

varying vec2 vUv;
varying float vFade;
varying float vPick;

void main() {
  // clamp obligatoire : sur les bords d'un quad très fin, vUv peut sortir de [0,1] et
  // pow(négatif) = NaN, que le bloom étale ensuite sur tout l'écran (image noire).
  float along = pow(clamp(vUv.y, 0.0, 1.0), 2.2); // queue transparente → tête brillante
  float across = 1.0 - abs(clamp(vUv.x, 0.0, 1.0) * 2.0 - 1.0);
  vec3 col = vPick < 0.6 ? uColorA : vPick < 0.9 ? uColorB : vec3(1.0);
  float a = across * along * vFade * uOpacity;
  gl_FragColor = max(vec4(col * a * 1.6, a), vec4(0.0)); // filet de sécurité anti-NaN
}
