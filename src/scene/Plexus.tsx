import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  DynamicDrawUsage,
  ShaderMaterial,
  type Group,
} from 'three';
import vertexShader from '../shaders/lines.vert';
import fragmentShader from '../shaders/lines.frag';
import { plexusNodes } from './shapes';
import { palette } from './palette';
import { sceneState } from './sceneState';

const LINK = 3.1; // distance max d'une liaison entre deux nœuds
const MOUSE_R = 4.2; // rayon d'influence du curseur

/**
 * Réseau neuronal (niveau Skills) : les nœuds proches sont reliés par des lignes dont
 * l'opacité dépend de la distance ; le curseur attire les nœuds et crée des connexions lumineuses.
 */
export function Plexus({ count }: { count: number }) {
  const group = useRef<Group>(null);
  const base = useMemo(() => plexusNodes().slice(0, count * 3), [count]);
  const current = useMemo(() => base.slice(), [base]);
  const maxSegments = count * 8 + count;

  const lineGeo = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new BufferAttribute(new Float32Array(maxSegments * 6), 3).setUsage(
      DynamicDrawUsage,
    );
    const alpha = new BufferAttribute(new Float32Array(maxSegments * 2), 1).setUsage(
      DynamicDrawUsage,
    );
    g.setAttribute('position', pos);
    g.setAttribute('aAlpha', alpha);
    return g;
  }, [maxSegments]);
  const lineMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uColor: { value: palette.accent }, uOpacity: { value: 0 } },
      }),
    [],
  );
  useEffect(() => () => lineGeo.dispose(), [lineGeo]);
  useEffect(() => () => lineMat.dispose(), [lineMat]);

  useFrame(() => {
    const w = sceneState.w[2];
    const g = group.current;
    if (!g) return;
    g.visible = w > 0.02;
    if (!g.visible) return;

    const center = sceneState.centers[2];
    const t = sceneState.time * sceneState.motion;
    const mouse = sceneState.mouseWorld;
    const force = sceneState.mouseForce;
    const n = count;

    // Dérive douce + attraction vers le curseur.
    for (let i = 0; i < n; i++) {
      const bx = base[i * 3] + Math.sin(t * 0.5 + i) * 0.25 + center.x;
      const by = base[i * 3 + 1] + Math.cos(t * 0.4 + i * 1.3) * 0.25 + center.y;
      const bz = base[i * 3 + 2] + center.z;
      const dx = mouse.x - bx;
      const dy = mouse.y - by;
      const dz = mouse.z - bz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const pull = d < MOUSE_R ? (1 - d / MOUSE_R) * 0.45 * force : 0;
      current[i * 3] = bx + dx * pull;
      current[i * 3 + 1] = by + dy * pull;
      current[i * 3 + 2] = bz + dz * pull;
    }

    const pos = lineGeo.getAttribute('position') as BufferAttribute;
    const alpha = lineGeo.getAttribute('aAlpha') as BufferAttribute;
    const P = pos.array as Float32Array;
    const A = alpha.array as Float32Array;
    let s = 0;
    const push = (
      ax: number,
      ay: number,
      az: number,
      bx: number,
      by: number,
      bz: number,
      a: number,
    ) => {
      if (s >= maxSegments) return;
      const o = s * 6;
      P[o] = ax;
      P[o + 1] = ay;
      P[o + 2] = az;
      P[o + 3] = bx;
      P[o + 4] = by;
      P[o + 5] = bz;
      A[s * 2] = a;
      A[s * 2 + 1] = a;
      s++;
    };
    for (let i = 0; i < n; i++) {
      const ix = current[i * 3];
      const iy = current[i * 3 + 1];
      const iz = current[i * 3 + 2];
      for (let j = i + 1; j < n; j++) {
        const dx = current[j * 3] - ix;
        const dy = current[j * 3 + 1] - iy;
        const dz = current[j * 3 + 2] - iz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < LINK * LINK) {
          const a = 1 - Math.sqrt(d2) / LINK;
          push(ix, iy, iz, current[j * 3], current[j * 3 + 1], current[j * 3 + 2], a * a * 0.55);
        }
      }
      // Connexions lumineuses vers le curseur.
      const mx = mouse.x - ix;
      const my = mouse.y - iy;
      const mz = mouse.z - iz;
      const md = Math.sqrt(mx * mx + my * my + mz * mz);
      if (force > 0.05 && md < MOUSE_R)
        push(mouse.x, mouse.y, mouse.z, ix, iy, iz, (1 - md / MOUSE_R) * force * 1.2);
    }
    lineGeo.setDrawRange(0, s * 2);
    pos.needsUpdate = true;
    alpha.needsUpdate = true;
    lineMat.uniforms.uOpacity.value = w * w;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lineGeo} material={lineMat} frustumCulled={false} />
    </group>
  );
}
