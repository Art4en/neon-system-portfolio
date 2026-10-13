import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { runtime } from '../store/runtime';
import { useAppStore } from '../store/useAppStore';
import { SECTIONS } from './sections';
import { clamp, damp } from './math';
import { prefersReducedMotion } from './env';

/**
 * Smooth scroll Lenis synchronisé avec ScrollTrigger sur UN SEUL requestAnimationFrame :
 * celui de gsap.ticker. La scène 3D est aussi avancée depuis ce ticker (voir Experience.tsx).
 *
 * À chaque frame on calcule aussi l'état partagé (runtime) : progression, vitesse,
 * « niveau » continu entre les sections, section active.
 */
let lenis: Lenis | null = null;
let offsets: number[] = [];
let vh = typeof window !== 'undefined' ? window.innerHeight : 800;
let lastY = 0;
let stopCount = 0;

const easeInOutExpo = (t: number) =>
  t === 0
    ? 0
    : t === 1
      ? 1
      : t < 0.5
        ? Math.pow(2, 20 * t - 10) / 2
        : (2 - Math.pow(2, -20 * t + 10)) / 2;

function measure() {
  vh = window.innerHeight;
  offsets = SECTIONS.map((s) => {
    const el = document.getElementById(s.id);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  runtime.maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
}

function update(dt: number) {
  const y = lenis ? lenis.animatedScroll : window.scrollY;
  const v = lenis ? lenis.velocity : y - lastY;
  lastY = y;
  runtime.scroll = y;
  runtime.progress = clamp(y / runtime.maxScroll);
  runtime.velocity = v;
  runtime.speed = damp(runtime.speed, Math.min(Math.abs(v) / 45, 1.6), 6, dt);

  // Niveau continu : chaque frontière de section ajoute 0 → 1 pendant qu'elle traverse l'écran
  // (du bas de l'écran jusqu'à 20 % du haut). Hero = 0 … Contact = 6.
  let level = 0;
  for (let b = 1; b < offsets.length; b++) level += clamp((y - (offsets[b] - vh)) / (vh * 0.8));
  runtime.level = level;

  let active = 0;
  for (let i = 0; i < offsets.length; i++) if (y + vh * 0.45 >= offsets[i]) active = i;

  const st = useAppStore.getState();
  if (st.activeIndex !== active) st.setActiveIndex(active);
  const xp = Math.round(runtime.progress * 100);
  if (st.xp !== xp) st.setXp(xp);
  if (st.phase === 'playing') {
    if (runtime.speed > 1.2) st.unlock('speedrunner');
    if (runtime.progress > 0.985) st.unlock('explorer');
  }
}

export function initScroll(): () => void {
  const reduced = prefersReducedMotion();
  if (!reduced) {
    lenis = new Lenis({ autoRaf: false, lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
  }
  let last = performance.now();
  const tick = (time: number) => {
    lenis?.raf(time * 1000);
    const now = performance.now();
    update(Math.min(0.1, (now - last) / 1000));
    last = now;
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  ScrollTrigger.addEventListener('refresh', measure);
  // Le contenu peut changer de hauteur (polices, images, filtres) → on recalcule.
  let raf = 0;
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => ScrollTrigger.refresh());
  });
  ro.observe(document.querySelector('main') ?? document.body);
  measure();
  if (stopCount > 0) lenis?.stop();

  return () => {
    gsap.ticker.remove(tick);
    ScrollTrigger.removeEventListener('refresh', measure);
    ro.disconnect();
    lenis?.destroy();
    lenis = null;
  };
}

export const getLenis = () => lenis;

/** Défilement doux vers une section (id), un élément ou une position. */
export function scrollToTarget(
  target: string | number | HTMLElement,
  {
    duration = 1.6,
    immediate = false,
    offset = 0,
    onComplete,
  }: { duration?: number; immediate?: boolean; offset?: number; onComplete?: () => void } = {},
) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (el === null) return;
  if (lenis) {
    lenis.scrollTo(el, {
      duration,
      immediate,
      offset,
      easing: easeInOutExpo,
      force: true,
      onComplete,
    });
    return;
  }
  const top =
    typeof el === 'number' ? el : el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
  if (onComplete) window.setTimeout(onComplete, immediate ? 0 : 900);
}

/** Bloque / débloque le scroll (modales, boot). Compteur pour gérer les ouvertures imbriquées. */
export function stopScroll() {
  stopCount++;
  lenis?.stop();
  document.documentElement.style.overflow = 'hidden';
}
export function startScroll() {
  stopCount = Math.max(0, stopCount - 1);
  if (stopCount === 0) {
    lenis?.start();
    document.documentElement.style.overflow = '';
  }
}
