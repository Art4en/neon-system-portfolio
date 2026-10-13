import { create } from 'zustand';
import { readStorage, writeStorage } from '../lib/storage';
import { ACHIEVEMENTS, type AchievementId } from '../lib/achievements';
import { sfx } from '../audio/synth';

export type Quality = 'low' | 'medium' | 'high' | 'ultra';
export type Accent = 'cyan' | 'magenta' | 'green';

export const QUALITIES: Quality[] = ['low', 'medium', 'high', 'ultra'];

export interface Toast {
  id: number;
  kind: 'achievement' | 'secret' | 'system' | 'milestone';
  title: string;
  subtitle?: string;
}

interface AppState {
  /** boot = séquence de démarrage affichée ; playing = le joueur a appuyé sur START. */
  phase: 'boot' | 'playing';
  /** La scène 3D a compilé ses shaders et rendu sa première image. */
  sceneReady: boolean;
  /** Section active (index dans SECTIONS). */
  activeIndex: number;
  /** Progression du scroll arrondie (0-100) pour la barre d'XP. */
  xp: number;
  soundOn: boolean;
  quality: Quality;
  /** true tant que l'utilisateur n'a pas choisi la qualité à la main. */
  qualityAuto: boolean;
  accent: Accent;
  godMode: boolean;
  /** Timestamp (ms) jusqu'auquel la pluie de code plein écran est active. */
  matrixUntil: number;
  rewinding: boolean;
  openProject: string | null;
  gameOpen: boolean;
  menuOpen: boolean;
  /** Parallaxe au gyroscope (mobile, uniquement si l'utilisateur l'active). */
  gyro: boolean;
  toasts: Toast[];
  achievements: AchievementId[];
  /** Incrémenté pour déclencher un glitch bref (post-processing + CSS). */
  glitchTick: number;

  setPhase: (phase: AppState['phase']) => void;
  setSceneReady: () => void;
  setActiveIndex: (i: number) => void;
  setXp: (xp: number) => void;
  toggleSound: () => void;
  setQuality: (q: Quality, manual?: boolean) => void;
  setAccent: (a: Accent) => void;
  setGodMode: (on: boolean) => void;
  triggerMatrix: (ms?: number) => void;
  setRewinding: (on: boolean) => void;
  setOpenProject: (slug: string | null) => void;
  setGameOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setGyro: (on: boolean) => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  unlock: (id: AchievementId) => void;
  glitch: () => void;
}

let toastId = 0;

export const useAppStore = create<AppState>()((set, get) => ({
  phase: 'boot',
  sceneReady: false,
  activeIndex: 0,
  xp: 0,
  soundOn: readStorage('neon.sound', false),
  quality: readStorage<Quality | null>('neon.quality', null) ?? 'high',
  qualityAuto: readStorage<Quality | null>('neon.quality', null) === null,
  accent: 'cyan',
  godMode: false,
  matrixUntil: 0,
  rewinding: false,
  openProject: null,
  gameOpen: false,
  menuOpen: false,
  gyro: false,
  toasts: [],
  achievements: readStorage<AchievementId[]>('neon.achievements', []),
  glitchTick: 0,

  setPhase: (phase) => set({ phase }),
  setSceneReady: () => set({ sceneReady: true }),
  setActiveIndex: (activeIndex) => set({ activeIndex }),
  setXp: (xp) => set({ xp }),
  toggleSound: () => {
    const soundOn = !get().soundOn;
    writeStorage('neon.sound', soundOn);
    sfx.setEnabled(soundOn);
    set({ soundOn });
    if (soundOn) sfx.blip();
  },
  setQuality: (quality, manual = false) => {
    if (manual) writeStorage('neon.quality', quality);
    set(manual ? { quality, qualityAuto: false } : { quality });
  },
  setAccent: (accent) => {
    document.documentElement.dataset.accent = accent;
    set({ accent });
  },
  setGodMode: (godMode) => {
    document.documentElement.dataset.god = godMode ? 'on' : 'off';
    set({ godMode });
  },
  triggerMatrix: (ms = 6000) => set({ matrixUntil: performance.now() + ms }),
  setRewinding: (rewinding) => set({ rewinding }),
  setOpenProject: (openProject) => set({ openProject }),
  setGameOpen: (gameOpen) => set({ gameOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setGyro: (gyro) => set({ gyro }),
  pushToast: (t) => {
    const id = ++toastId;
    set({ toasts: [...get().toasts.slice(-3), { ...t, id }] });
    window.setTimeout(() => get().dismissToast(id), 4800);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  unlock: (id) => {
    const { achievements } = get();
    if (achievements.includes(id)) return;
    const next = [...achievements, id];
    writeStorage('neon.achievements', next);
    set({ achievements: next });
    const def = ACHIEVEMENTS[id];
    get().pushToast({
      kind: def.secret ? 'secret' : 'achievement',
      title: def.title,
      subtitle: def.description,
    });
    sfx.achievement();
  },
  glitch: () => set({ glitchTick: get().glitchTick + 1 }),
}));
