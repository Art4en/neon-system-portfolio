import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  Sphere,
  Vector3,
} from 'three';
import vertexShader from '../shaders/particles.vert';
import fragmentShader from '../shaders/particles.frag';
import { seededRandom } from '../lib/pixelFont';
import { handle } from '../lib/content';
import { runtime } from '../store/runtime';
import {
  gridShape,
  helixShape,
  plexusNodes,
  plexusShape,
  randomAttr,
  sphereShape,
  textToPoints,
  tunnelShape,
  vortexShape,
} from './shapes';
import { sceneState } from './sceneState';
import { palette } from './palette';

/** Opacité globale des particules selon le niveau (le champ du Hero reste discret). */
const LEVEL_OPACITY = [0.55, 0.95, 0.9, 0.75, 0.95, 1, 0.95];

/**
 * Système de particules unique : 5 000 → 32 000 points (selon la qualité) qui se
 * transforment d'une forme à l'autre au fil du scroll.
 */
export function Particles({ count }: { count: number }) {
  const gl = useThree((s) => s.gl);

  const geometry = useMemo(() => {
    const r = seededRandom('neon-particles');
    const nodes = plexusNodes();
    const g = new BufferGeometry();
    const sphere = sphereShape(count, r);
    g.setAttribute('position', new BufferAttribute(gridShape(count, r), 3));
    g.setAttribute('aSphere', new BufferAttribute(sphere, 3));
    g.setAttribute('aPlexus', new BufferAttribute(plexusShape(count, r, nodes), 3));
    g.setAttribute('aTunnel', new BufferAttribute(tunnelShape(count, r), 3));
    g.setAttribute('aHelix', new BufferAttribute(helixShape(count, r), 3));
    // Le texte est rempli quand la police est chargée (voir plus bas) ; en attendant : la sphère.
    g.setAttribute('aText', new BufferAttribute(sphere.slice(), 3));
    g.setAttribute('aVortex', new BufferAttribute(vortexShape(count, r), 3));
    g.setAttribute('aRandom', new BufferAttribute(randomAttr(count, r), 4));
    // Les positions finales sont calculées dans le shader : on évite le frustum culling.
    g.boundingSphere = new Sphere(new Vector3(0, 0, -110), 500);
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        // Les formes restent lisibles même derrière les montagnes (rendu additif, pas de tri utile).
        depthTest: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMotion: { value: 1 },
          uFrom: { value: 0 },
          uTo: { value: 1 },
          uMorph: { value: 0 },
          uOffsets: { value: sceneState.centers },
          uFlow: { value: 0 },
          uWarp: { value: 0 },
          uHelix: { value: 0 },
          uMouse: { value: sceneState.mouseWorld },
          uMouseForce: { value: 0 },
          uExplode: { value: 0 },
          uSize: { value: 2.2 },
          uPixelRatio: { value: 1 },
          uSpeed: { value: 0 },
          uOpacity: { value: 1 },
          uColorA: { value: palette.accent },
          uColorB: { value: palette.second },
          uColorC: { value: palette.violet },
          uColorD: { value: palette.yellow },
        },
      }),
    [],
  );

  // Forme « pseudo » : on attend la police Orbitron pour que le texte soit fidèle.
  useEffect(() => {
    let cancelled = false;
    const fill = () => {
      if (cancelled) return;
      const pts = textToPoints(
        handle.toUpperCase(),
        count,
        seededRandom('neon-text'),
        sceneState.aspect < 1 ? 11 : 24,
      );
      const attr = geometry.getAttribute('aText') as BufferAttribute;
      (attr.array as Float32Array).set(pts);
      attr.needsUpdate = true;
    };
    // Échantillonnage du texte en tâche de fond : la forme ne sert qu'au niveau Console.
    const idle = (cb: () => void) => {
      if (typeof window.requestIdleCallback === 'function')
        window.requestIdleCallback(cb, { timeout: 3000 });
      else setTimeout(cb, 600);
    };
    document.fonts.load('900 120px "Orbitron Variable"').then(
      () => idle(fill),
      () => idle(fill),
    );
    return () => {
      cancelled = true;
    };
  }, [geometry, count]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const u = material.uniforms;
    const level = sceneState.level;
    const from = Math.min(6, Math.floor(level));
    const to = Math.min(6, from + 1);
    const morph = level - from;
    u.uTime.value = sceneState.time;
    u.uMotion.value = sceneState.motion;
    u.uFrom.value = from;
    u.uTo.value = to;
    u.uMorph.value = morph;
    u.uFlow.value = sceneState.travel % 96;
    u.uWarp.value = sceneState.warp % 70;
    u.uHelix.value = sceneState.helix;
    u.uMouseForce.value = sceneState.mouseForce;
    u.uExplode.value = runtime.explode;
    u.uSpeed.value = Math.min(1.2, sceneState.speed);
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uSize.value = sceneState.aspect < 1 ? 1.6 : 2.2;
    const o = LEVEL_OPACITY[from] + (LEVEL_OPACITY[to] - LEVEL_OPACITY[from]) * morph;
    u.uOpacity.value = o * Math.min(1, 0.25 + runtime.intro);
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
