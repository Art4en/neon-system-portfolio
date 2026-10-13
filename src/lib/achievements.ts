/** Succès que le VISITEUR peut débloquer (stockés en localStorage). */
export const ACHIEVEMENTS = {
  explorer: { title: 'EXPLORATEUR', description: 'Atteindre le bout du monde', secret: false },
  curious: { title: 'CURIEUX', description: 'Ouvrir un briefing de mission', secret: false },
  hacker: { title: 'HACKER', description: 'Utiliser le terminal', secret: false },
  networker: { title: 'NETWORKER', description: "Copier l'adresse email", secret: false },
  speedrunner: { title: 'SPEEDRUNNER', description: 'Scroller à pleine vitesse', secret: false },
  timetraveler: { title: 'TIME TRAVELER', description: 'Rembobiner le voyage', secret: false },
  gamer: { title: 'HIGH SCORE', description: 'Lancer le mini-jeu caché', secret: false },
  konami: { title: 'GOD MODE', description: '↑ ↑ ↓ ↓ ← → ← → B A', secret: true },
  neo: { title: 'WAKE UP, NEO', description: 'Suivre le lapin blanc', secret: true },
  spam: { title: 'SPAM CLICK', description: 'Le logo a des sentiments, tu sais', secret: true },
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;
