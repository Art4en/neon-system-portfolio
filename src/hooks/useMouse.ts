import { useEffect } from 'react';
import { runtime } from '../store/runtime';

/**
 * Écoute la souris sur `window` (le canvas reste en pointer-events: none) et alimente
 * runtime.mouse : position en px, normalisée (-1 → 1) et présence dans la fenêtre.
 */
export function useMouse() {
  useEffect(() => {
    const m = runtime.mouse;
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      m.x = e.clientX;
      m.y = e.clientY;
      m.nx = (e.clientX / window.innerWidth) * 2 - 1;
      m.ny = (e.clientY / window.innerHeight) * 2 - 1;
      m.active = true;
    };
    const leave = () => {
      m.active = false;
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
    };
  }, []);
}
