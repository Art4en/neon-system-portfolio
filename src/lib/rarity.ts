import type { Rarity } from '../content/portfolio';

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Commun',
  rare: 'Rare',
  epic: 'Épique',
  legendary: 'Légendaire',
};

/** Couleurs de rareté (identiques aux variables CSS --rarity-*). */
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#9DA5B4',
  rare: '#00A8FF',
  epic: '#B44CFF',
  legendary: '#FFB020',
};
