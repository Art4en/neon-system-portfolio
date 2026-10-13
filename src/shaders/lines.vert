// Lignes du plexus : l'opacité de chaque segment dépend de la distance entre les nœuds.
attribute float aAlpha;
varying float vAlpha;

void main() {
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
