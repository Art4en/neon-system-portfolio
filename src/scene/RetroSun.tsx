import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, PlaneGeometry, ShaderMaterial, type Mesh } from 'three';
import vertexShader from '../shaders/uv.vert';
import fragmentShader from '../shaders/sun.frag';
import { palette } from './palette';
import { sceneState } from './sceneState';
import { runtime } from '../store/runtime';
import { clamp } from '../lib/math';

/** Soleil rétro à l'horizon. Il suit la caméra (comme un décor lointain) et se couche au fil du scroll. */
export function RetroSun() {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => new PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uTop: { value: palette.sunTop },
          uBottom: { value: palette.sunBottom },
          uOpacity: { value: 1 },
        },
      }),
    [],
  );
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
    const l = sceneState.level;
    const set = clamp(l / 2); // 0 → 1 : le soleil se couche entre le Hero et les Skills
    const c = sceneState.camPos;
    mesh.position.set(
      c.x * 0.9,
      8 - set * 26 + (1 - Math.min(1, runtime.intro * 1.2)) * -10,
      c.z - 165,
    );
    mesh.scale.setScalar(sceneState.aspect < 1 ? 52 : 78);
    material.uniforms.uTime.value = sceneState.time * sceneState.motion;
    material.uniforms.uOpacity.value = (1 - set * 0.85) * clamp(runtime.intro * 1.4);
    mesh.visible = set < 0.999;
  });

  return (
    <mesh
      ref={ref}
      geometry={geometry}
      material={material}
      renderOrder={-1}
      frustumCulled={false}
    />
  );
}
