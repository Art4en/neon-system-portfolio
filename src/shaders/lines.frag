uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;

void main() {
  float a = vAlpha * uOpacity;
  gl_FragColor = vec4(uColor * a, a);
}
