import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PlaneGeometry, type Mesh } from 'three';
import { createTerrainMaterial, GRID_CELL } from './terrainMaterial';
import { gridIntensity, sceneState } from './sceneState';
import { runtime } from '../store/runtime';

const WIDTH = 72;
const DEPTH = 240;
const INNER = 9; // les montagnes commencent à |x| = 9, là où s'arrête le sol

/**
 * Montagnes en fil de fer générées au bruit simplex (dans le vertex shader), de chaque côté.
 * Le maillage est recalé sur le pas de la grille à chaque frame : le relief défile sans « nager ».
 */
export function Mountains({ density }: { density: number }) {
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const segZ = Math.max(40, Math.round((DEPTH * density) / 2) * 2); // pair → sommets alignés
  const segX = Math.max(16, Math.round(WIDTH * density));
  const cellZ = DEPTH / segZ;

  const geometry = useMemo(
    () => new PlaneGeometry(WIDTH, DEPTH, segX, segZ).rotateX(-Math.PI / 2),
    [segX, segZ],
  );
  const material = useMemo(() => createTerrainMaterial(true, GRID_CELL), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const travel = sceneState.travel;
    // z ≡ travel (mod cellZ) → chaque sommet tombe pile sur le réseau du terrain.
    const z = Math.round((sceneState.camPos.z - DEPTH / 2 + 20 - travel) / cellZ) * cellZ + travel;
    if (left.current) left.current.position.z = z;
    if (right.current) right.current.position.z = z;
    material.uniforms.uTravel.value = travel;
    material.uniforms.uIntensity.value =
      gridIntensity() * (0.35 + 0.65 * Math.min(1, runtime.intro * 1.5));
  });

  return (
    <>
      <mesh
        ref={left}
        geometry={geometry}
        material={material}
        position-x={-(INNER + WIDTH / 2)}
        frustumCulled={false}
      />
      <mesh
        ref={right}
        geometry={geometry}
        material={material}
        position-x={INNER + WIDTH / 2}
        frustumCulled={false}
      />
    </>
  );
}
