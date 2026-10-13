/** Détections d'environnement (évaluées une fois au chargement). */
export const isTouch =
  typeof window !== 'undefined' &&
  (window.matchMedia('(hover: none), (pointer: coarse)').matches || navigator.maxTouchPoints > 0);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth < 768;

/** WebGL disponible ? (sinon : fond de repli en CSS). */
export const hasWebGL = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
    return ok;
  } catch {
    return false;
  }
})();
