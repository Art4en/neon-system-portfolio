// Tunnel hyperespace : chaque instance est un trait lumineux (quad) disposé sur un cylindre
// autour de l'axe de la caméra. Il fonce vers la caméra ; sa longueur dépend de la vitesse du scroll.
attribute vec4 aLine;   // x : angle · y : rayon · z : position de départ · w : vitesse
attribute vec3 aStyle;  // x : longueur · y : épaisseur · z : choix de couleur

uniform vec3 uCam;
uniform float uTravel;
uniform float uLen;
uniform float uStretch;

varying vec2 vUv;
varying float vFade;
varying float vPick;

void main() {
  float z = mod(aLine.z + uTravel * aLine.w, uLen); // 0 (loin) → uLen (caméra)
  vec3 head = uCam + vec3(cos(aLine.x) * aLine.y, sin(aLine.x) * aLine.y, -uLen + z + 2.0);
  float len = aStyle.x * (1.0 + uStretch * 7.0);
  vec3 tail = head - vec3(0.0, 0.0, len);
  // Quad orienté face à l'axe du tunnel (donc face à la caméra).
  vec3 side = normalize(cross(vec3(0.0, 0.0, 1.0), head - uCam));
  vec3 p = mix(tail, head, position.y + 0.5) + side * position.x * aStyle.y;
  vUv = position.xy + 0.5;
  float k = z / uLen;
  vFade = smoothstep(0.0, 0.25, k) * (1.0 - smoothstep(0.92, 1.0, k));
  vPick = aStyle.z;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
