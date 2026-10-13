// Lignes de grille anti-aliasées grâce à fwidth() : épaisseur constante à l'écran,
// pas d'escalier, et atténuation au loin pour éviter le moiré.
uniform vec3 uLine;       // couleur des lignes du sol (accent)
uniform vec3 uLine2;      // couleur des sommets (magenta)
uniform vec3 uFog;        // couleur de la brume d'horizon
uniform float uFogNear;
uniform float uFogFar;
uniform float uIntensity; // luminosité selon le niveau
uniform float uCell;      // taille d'une case

varying vec2 vCoord;
varying float vHeight;
varying float vDist;

void main() {
  vec2 c = vCoord / uCell;
  vec2 fw = max(fwidth(c), vec2(1e-5)); // jamais de division par zéro
  vec2 g = abs(fract(c - 0.5) - 0.5) / fw;
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  // halo doux autour des lignes : c'est lui qui « nourrit » le bloom
  vec2 g2 = abs(fract(c - 0.5) - 0.5) / (fw * 5.0);
  float halo = (1.0 - min(min(g2.x, g2.y), 1.0)) * 0.22;
  // au loin, les lignes deviennent plus fines que le pixel : on les estompe (anti-moiré)
  float far = 1.0 - smoothstep(0.25, 0.9, max(fw.x, fw.y));

  float hmix = smoothstep(0.4, 9.0, vHeight);
  vec3 lineCol = mix(uLine, uLine2, hmix);
  vec3 base = mix(vec3(0.008, 0.009, 0.025), vec3(0.03, 0.0, 0.05), hmix);
  vec3 col = base + lineCol * (line + halo) * far * uIntensity;

  float fog = smoothstep(uFogNear, uFogFar, vDist);
  col = mix(col, uFog, fog);
  gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
