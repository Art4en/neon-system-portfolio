import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  PlaneGeometry,
  ShaderMaterial,
  type Mesh,
} from 'three';
import vertexShader from '../shaders/warp.vert';
import fragmentShader from '../shaders/warp.frag';
import { palette } from './palette';
import { sceneState } from './sceneState';
import { seededRandom } from '../lib/pixelFont';

const LEN = 120;

/** Saut en hyperespace : traits lumineux instanciés, étirés par la vitesse du scroll. */
export function WarpTunnel({ count }: { count: number }) {
  const ref = useRef<Mesh>(null);

  const geometry = useMemo(() => {
    const r = seededRandom('neon-warp');
    const base = new PlaneGeometry(1, 1);
    const g = new InstancedBufferGeometry();
    g.index = base.index;
    g.setAttribute('position', base.getAttribute('position'));
    const line = new Float32Array(count * 4);
    const style = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      line.set(
        [r() * Math.PI * 2, 2.5 + Math.pow(r(), 0.8) * 10, r() * LEN, 0.6 + r() * 0.9],
        i * 4,
      );
      style.set([2 + r() * 6, 0.03 + r() * 0.06, r()], i * 3);
    }
    g.setAttribute('aLine', new InstancedBufferAttribute(line, 4));
    g.setAttribute('aStyle', new InstancedBufferAttribute(style, 3));
    g.instanceCount = count;
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide, // les quads sont vus depuis l'intérieur du tunnel
        uniforms: {
          uCam: { value: sceneState.camPos },
          uTravel: { value: 0 },
          uLen: { value: LEN },
          uStretch: { value: 0 },
          uOpacity: { value: 0 },
          uColorA: { value: palette.accent },
          uColorB: { value: palette.second },
        },
      }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    // Visible autour du niveau « Missions », avec un fondu large pour l'entrée / la sortie.
    const w = Math.max(0, 1 - Math.abs(sceneState.level - 3) / 1.2);
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = w > 0.01;
    if (!mesh.visible) return;
    material.uniforms.uTravel.value = sceneState.warp;
    material.uniforms.uStretch.value = Math.min(1.4, sceneState.speed);
    material.uniforms.uOpacity.value = w * w;
  });

  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
