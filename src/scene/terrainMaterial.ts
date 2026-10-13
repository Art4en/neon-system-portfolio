import { ShaderMaterial } from 'three';
import vertexShader from '../shaders/terrain.vert';
import fragmentShader from '../shaders/terrain.frag';
import { palette } from './palette';

/** Matériau partagé par le sol et les montagnes (lignes anti-aliasées, brume d'horizon). */
export function createTerrainMaterial(mountain: boolean, cell: number) {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTravel: { value: 0 },
      uMountain: { value: mountain ? 1 : 0 },
      uLine: { value: palette.accent },
      uLine2: { value: palette.second },
      uFog: { value: palette.horizon },
      uFogNear: { value: 25 },
      uFogFar: { value: 150 },
      uIntensity: { value: 1 },
      uCell: { value: cell },
    },
  });
}

/** Taille d'une case de la grille (unités monde). */
export const GRID_CELL = 2;
