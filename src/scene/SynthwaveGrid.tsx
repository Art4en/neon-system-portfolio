import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry, type Mesh } from 'three';
import { createTerrainMaterial, GRID_CELL } from './terrainMaterial';
import { gridIntensity, sceneState } from './sceneState';
import { runtime } from '../store/runtime';

const DEPTH = 260;

/** Sol en grille néon infinie : un plan qui suit la caméra, les lignes défilent dans le shader. */
export function SynthwaveGrid() {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => new PlaneGeometry(18, DEPTH, 1, 1).rotateX(-Math.PI / 2), []);
  const material = useMemo(() => createTerrainMaterial(false, GRID_CELL), []);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.position.z = sceneState.camPos.z - DEPTH / 2 + 20;
    material.uniforms.uTravel.value = sceneState.travel;
    material.uniforms.uIntensity.value =
      gridIntensity() * (0.35 + 0.65 * Math.min(1, runtime.intro * 1.5));
  });

  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
