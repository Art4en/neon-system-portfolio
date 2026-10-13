import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  TorusGeometry,
  type Group,
} from 'three';
import vertexShader from '../shaders/uv.vert';
import fragmentShader from '../shaders/portal.frag';
import { palette } from './palette';
import { sceneState } from './sceneState';

/** Portail du niveau Contact : disque à distorsion en spirale + anneau néon (le tore de particules l'entoure). */
export function Portal() {
  const group = useRef<Group>(null);
  const disc = useMemo(() => new PlaneGeometry(1, 1), []);
  const ring = useMemo(() => new TorusGeometry(3.05, 0.025, 8, 160), []);
  const discMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uRing: { value: palette.accent },
          uArmA: { value: palette.second },
          uArmB: { value: palette.violet },
        },
      }),
    [],
  );
  const ringMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: palette.accent,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );
  useEffect(
    () => () => {
      disc.dispose();
      ring.dispose();
      discMat.dispose();
      ringMat.dispose();
    },
    [disc, ring, discMat, ringMat],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const w = Math.max(0, 1 - Math.abs(sceneState.level - 6) / 1.1);
    g.visible = w > 0.01;
    if (!g.visible) return;
    g.position.copy(sceneState.centers[6]);
    g.position.z -= 1;
    const t = sceneState.time * sceneState.motion;
    discMat.uniforms.uTime.value = t;
    discMat.uniforms.uOpacity.value = w;
    ringMat.opacity = w * (0.7 + 0.3 * Math.sin(t * 3));
    ringMat.color.copy(palette.accent);
    g.rotation.z = t * 0.2;
  });

  return (
    <group ref={group}>
      <mesh geometry={disc} material={discMat} scale={7.6} frustumCulled={false} />
      <mesh geometry={ring} material={ringMat} frustumCulled={false} />
    </group>
  );
}
