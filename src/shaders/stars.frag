uniform float uOpacity;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.85, 0.92, 1.0) * a, a * vAlpha * uOpacity);
}
