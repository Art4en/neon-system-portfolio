import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { runtime } from '../store/runtime';
import { useAppStore } from '../store/useAppStore';
import { clamp, damp } from '../lib/math';
import { prefersReducedMotion } from '../lib/env';
import { INTRO_FROM, LEVELS, shapeCenters } from './levels';
import { sceneState } from './sceneState';
import { updatePalette } from './palette';

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Pilote la caméra : voyage entre les ancrages de niveaux selon le scroll, plongée d'intro,
 * parallaxe souris. Calcule aussi l'état partagé de la scène (sceneState) pour les autres objets.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const tmp = useMemo(
    () => ({
      pos: new Vector3(),
      look: new Vector3(),
      a: new Vector3(),
      b: new Vector3(),
      par: new Vector2(),
      ndc: new Vector2(),
      ray: new Raycaster(),
      plane: new Plane(),
      hit: new Vector3(),
      center: new Vector3(),
      fwd: new Vector3(),
      springPos: new Vector3(0, -50, 0),
      springVel: new Vector3(),
    }),
    [],
  );

  // Adapte le cadrage (FOV) et la position des formes au format de l'écran.
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    sceneState.aspect = aspect;
    camera.fov = aspect < 0.8 ? 72 : aspect < 1.2 ? 62 : 55;
    camera.updateProjectionMatrix();
    shapeCenters(aspect).forEach((c, i) => sceneState.centers[i].copy(c));
  }, [camera, size]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const reduced = prefersReducedMotion();
    const { rewinding } = useAppStore.getState();
    sceneState.dt = dt;
    sceneState.time += dt;
    sceneState.motion = reduced ? 0.15 : 1;
    sceneState.rewind = damp(sceneState.rewind, rewinding ? 1 : 0, 6, dt);
    sceneState.speed = runtime.speed;

    // Niveau continu (déjà lissé par Lenis) + légère inertie pour la caméra.
    const target = reduced ? 0 : runtime.level;
    sceneState.level = damp(sceneState.level, target, 5, dt);
    const level = sceneState.level;
    for (let i = 0; i < sceneState.w.length; i++) sceneState.w[i] = clamp(1 - Math.abs(level - i));

    // Position entre deux ancrages, avec une courbe douce.
    const i0 = Math.min(LEVELS.length - 1, Math.floor(level));
    const i1 = Math.min(LEVELS.length - 1, i0 + 1);
    const t = smoother(clamp(level - i0));
    tmp.pos.lerpVectors(LEVELS[i0].cam, LEVELS[i1].cam, t);
    tmp.look.lerpVectors(LEVELS[i0].look, LEVELS[i1].look, t);

    // Plongée dans le paysage après PRESS START.
    if (runtime.intro < 1) {
      const e = easeOutExpo(runtime.intro);
      tmp.pos.lerpVectors(INTRO_FROM.cam, tmp.pos, e);
      tmp.look.lerpVectors(INTRO_FROM.look, tmp.look, e);
    }

    // Parallaxe souris (amortie).
    const m = runtime.mouse;
    const amp = reduced ? 0 : 1;
    tmp.par.x = damp(tmp.par.x, m.nx * 0.65 * amp, 2.5, dt);
    tmp.par.y = damp(tmp.par.y, -m.ny * 0.35 * amp, 2.5, dt);
    tmp.pos.x += tmp.par.x;
    tmp.pos.y += tmp.par.y;
    tmp.look.x += tmp.par.x * 0.35;

    // Petit tremblement pendant le rembobinage.
    if (sceneState.rewind > 0.01) {
      tmp.pos.x += (Math.random() - 0.5) * 0.08 * sceneState.rewind;
      tmp.pos.y += (Math.random() - 0.5) * 0.08 * sceneState.rewind;
    }

    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);
    sceneState.camPos.copy(tmp.pos);

    // Défilement du terrain : vitesse de base + vitesse du scroll ; à l'envers pendant le rembobinage.
    const flow = sceneState.rewind > 0.5 ? -45 : 6 + clamp(runtime.velocity, -60, 60) * 0.45;
    sceneState.travel += dt * flow * sceneState.motion;
    sceneState.warp += dt * (24 + runtime.speed * 70) * sceneState.motion;
    sceneState.helix =
      level * 1.2 + runtime.scroll * 0.0016 + sceneState.time * 0.08 * sceneState.motion;

    // Curseur projeté dans la scène, suivi par un ressort (→ retour élastique des particules).
    tmp.center.lerpVectors(sceneState.centers[i0], sceneState.centers[i1], t);
    tmp.ndc.set(m.nx, -m.ny);
    tmp.ray.setFromCamera(tmp.ndc, state.camera);
    if (level < 0.5) tmp.plane.set(new Vector3(0, 1, 0), -0.3);
    else {
      camera.getWorldDirection(tmp.fwd);
      tmp.plane.setFromNormalAndCoplanarPoint(tmp.fwd.negate(), tmp.center);
    }
    const hit = tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit);
    if (hit && m.active) {
      tmp.springVel.addScaledVector(tmp.hit.sub(tmp.springPos), 70 * dt);
      tmp.springVel.multiplyScalar(Math.exp(-8 * dt));
      tmp.springPos.addScaledVector(tmp.springVel, dt);
    }
    sceneState.mouseWorld.copy(tmp.springPos);
    sceneState.mouseForce = damp(sceneState.mouseForce, m.active && hit && !reduced ? 1 : 0, 3, dt);

    runtime.explode = damp(runtime.explode, 0, 1.4, dt);
    updatePalette(dt);
  }, -1);

  return null;
}
