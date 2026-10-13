// Sol synthwave + montagnes en fil de fer.
// Le maillage suit la caméra mais reste « calé » sur la grille du terrain (voir SynthwaveGrid.tsx),
// donc le relief ne « nage » pas quand il défile.
#include ./chunks/noise.glsl

uniform float uTravel;    // distance parcourue : fait défiler le terrain vers la caméra
uniform float uMountain;  // 0 = sol plat, 1 = bande de montagnes

varying vec2 vCoord;
varying float vHeight;
varying float vDist;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec2 coord = vec2(world.x, world.z - uTravel);
  float h = 0.0;
  if (uMountain > 0.5) {
    float ax = abs(world.x);
    float ramp = smoothstep(9.0, 24.0, ax);
    float n = snoise(vec3(coord * 0.042, 0.0)) * 0.5 + 0.5;
    n += 0.45 * (snoise(vec3(coord * 0.11, 1.7)) * 0.5 + 0.5);
    // plus hautes à mesure qu'on s'éloigne du couloir central
    h = ramp * pow(max(n, 0.0), 1.7) * (5.0 + ax * 0.32);
  }
  world.y += h;
  vHeight = h;
  vCoord = coord;
  vec4 mv = viewMatrix * world;
  vDist = -mv.z;
  gl_Position = projectionMatrix * mv;
}
