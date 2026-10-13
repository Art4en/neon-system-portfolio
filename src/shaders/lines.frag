uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;

void main() {
  float a = vAlpha * uOpacity;
  gl_FragColor = max(vec4(uColor * a, a), vec4(0.0));
}
