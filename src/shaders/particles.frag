// Point rond et doux avec halo ; étiré verticalement quand on scrolle vite (« motion blur »).
uniform float uOpacity;
uniform float uSpeed;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  uv.x *= 1.0 + uSpeed * 1.8;
  float d = length(uv);
  if (d > 0.5) discard;
  float soft = 1.0 - smoothstep(0.0, 0.5, d);
  float glow = pow(soft, 2.0);
  float core = pow(soft, 9.0);
  vec3 col = vColor * glow * 1.5 + vec3(1.0) * core * 0.8;
  gl_FragColor = max(vec4(col, glow * vAlpha * uOpacity), vec4(0.0));
}
