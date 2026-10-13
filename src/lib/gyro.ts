import { runtime } from '../store/runtime';
import { clamp } from './math';

type DOEWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const onOrient = (e: DeviceOrientationEvent) => {
  // Inclinaison du téléphone → même effet de parallaxe que la souris (sans répulsion des particules).
  runtime.mouse.nx = clamp((e.gamma ?? 0) / 35, -1, 1);
  runtime.mouse.ny = clamp(((e.beta ?? 50) - 50) / 35, -1, 1);
};

export const gyroSupported = () =>
  typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;

/** Active la parallaxe au gyroscope. iOS demande une autorisation explicite (geste utilisateur requis). */
export async function enableGyro(): Promise<boolean> {
  if (!gyroSupported()) return false;
  const DOE = window.DeviceOrientationEvent as DOEWithPermission;
  try {
    if (
      typeof DOE.requestPermission === 'function' &&
      (await DOE.requestPermission()) !== 'granted'
    )
      return false;
  } catch {
    return false;
  }
  window.addEventListener('deviceorientation', onOrient);
  return true;
}

export function disableGyro() {
  window.removeEventListener('deviceorientation', onOrient);
  runtime.mouse.nx = 0;
  runtime.mouse.ny = 0;
}
