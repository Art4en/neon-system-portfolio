import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  ShaderMaterial,
  SphereGeometry,
  type Group,
} from 'three';
import skyVert from '../shaders/sky.vert';
import skyFrag from '../shaders/sky.frag';
import starsVert from '../shaders/stars.vert';
import starsFrag from '../shaders/stars.frag';
import { palette } from './palette';
import { sceneState } from './sceneState';
import { seededRandom } from '../lib/pixelFont';

/** Dôme de ciel (dégradé + lueur d'horizon) et étoiles qui scintillent. Suit la caméra. */
export function Sky({ stars }: { stars: number }) {
  const group = useRef<Group>(null);

  const dome = useMemo(() => new SphereGeometry(190, 32, 16), []);
  const domeMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: skyVert,
        fragmentShader: skyFrag,
        side: BackSide,
        depthWrite: false,
        uniforms: {
          uZenith: { value: palette.zenith },
          uHorizon: { value: palette.horizon },
          uGlow: { value: palette.glow },
          uGlowStrength: { value: 0.35 },
        },
      }),
    [],
  );

  const starGeo = useMemo(() => {
    const r = seededRandom('neon-stars');
    const pos = new Float32Array(stars * 3);
    const attr = new Float32Array(stars * 2);
    for (let i = 0; i < stars; i++) {
      const th = r() * Math.PI * 2;
      const y = 0.03 + Math.pow(r(), 0.8) * 0.97;
      const rad = Math.sqrt(1 - y * y);
      pos.set([Math.cos(th) * rad * 170, y * 170, Math.sin(th) * rad * 170], i * 3);
      attr.set([r(), Math.pow(r(), 3)], i * 2);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aStar', new BufferAttribute(attr, 2));
    return g;
  }, [stars]);
  const starMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: starsVert,
        fragmentShader: starsFrag,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOpacity: { value: 1 } },
      }),
    [],
  );

  useEffect(() => () => dome.dispose(), [dome]);
  useEffect(() => () => domeMat.dispose(), [domeMat]);
  useEffect(() => () => starGeo.dispose(), [starGeo]);
  useEffect(() => () => starMat.dispose(), [starMat]);

  useFrame((state) => {
    group.current?.position.copy(sceneState.camPos);
    starMat.uniforms.uTime.value = sceneState.time * sceneState.motion;
    starMat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    // La lueur d'horizon faiblit quand on quitte le paysage, puis revient vers le portail.
    domeMat.uniforms.uGlowStrength.value =
      0.38 - Math.min(1, sceneState.level / 3) * 0.2 + sceneState.w[6] * 0.15;
  });

  return (
    <group ref={group}>
      <mesh geometry={dome} material={domeMat} renderOrder={-2} frustumCulled={false} />
      <points geometry={starGeo} material={starMat} renderOrder={-1} frustumCulled={false} />
    </group>
  );
}
