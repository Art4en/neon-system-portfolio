import { Color } from 'three';
import { useAppStore } from '../store/useAppStore';

/**
 * Palette partagée par tous les shaders (mêmes valeurs que src/styles/tokens.css).
 * Les uniforms référencent directement ces objets Color : changer la palette ici
 * (commande `theme`, God Mode) met à jour toute la scène sans re-render.
 */
export const COLORS = {
  bg: new Color('#05060A'),
  cyan: new Color('#00F0FF'),
  magenta: new Color('#FF2BD6'),
  violet: new Color('#7B2DFF'),
  green: new Color('#39FF14'),
  yellow: new Color('#FFE600'),
};

export const palette = {
  /** Couleur d'accent courante (cyan par défaut). */
  accent: COLORS.cyan.clone(),
  /** Couleur secondaire courante (magenta par défaut). */
  second: COLORS.magenta.clone(),
  violet: COLORS.violet.clone(),
  yellow: COLORS.yellow.clone(),
  sunTop: new Color('#FFE600'),
  sunBottom: new Color('#FF2BD6'),
  horizon: new Color('#1a0631'),
  zenith: new Color('#05060A'),
  glow: new Color('#ff2bd6'),
};

const targetAccent = new Color();
const targetSecond = new Color();

/** Fait glisser la palette vers la cible (thème / God Mode) — appelé à chaque frame. */
export function updatePalette(dt: number) {
  const { accent, godMode } = useAppStore.getState();
  if (godMode || accent === 'green') {
    targetAccent.copy(COLORS.green);
    targetSecond.copy(godMode ? COLORS.green : COLORS.cyan);
  } else if (accent === 'magenta') {
    targetAccent.copy(COLORS.magenta);
    targetSecond.copy(COLORS.cyan);
  } else {
    targetAccent.copy(COLORS.cyan);
    targetSecond.copy(COLORS.magenta);
  }
  const k = 1 - Math.exp(-4 * dt);
  palette.accent.lerp(targetAccent, k);
  palette.second.lerp(targetSecond, k);
  palette.glow.lerp(godMode ? COLORS.green : COLORS.magenta, k);
  palette.sunBottom.lerp(godMode ? COLORS.green : COLORS.magenta, k);
}
