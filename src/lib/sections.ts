/** Métadonnées décoratives des niveaux (labels du HUD, pas du contenu personnel). */
export const SECTIONS = [
  { id: 'hero', num: '01', title: 'START', nav: 'Start', pause: 'RESUME' },
  { id: 'about', num: '02', title: 'PLAYER PROFILE', nav: 'Profil', pause: 'PROFILE' },
  { id: 'skills', num: '03', title: 'SKILL TREE', nav: 'Skills', pause: 'SKILLS' },
  { id: 'projects', num: '04', title: 'MISSIONS', nav: 'Missions', pause: 'MISSIONS' },
  { id: 'timeline', num: '05', title: 'ACHIEVEMENTS', nav: 'Parcours', pause: 'ACHIEVEMENTS' },
  { id: 'terminal', num: '06', title: 'CONSOLE', nav: 'Console', pause: 'CONSOLE' },
  { id: 'contact', num: '07', title: 'JOIN MY PARTY', nav: 'Contact', pause: 'CONTACT' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
export const sectionIndex = (id: SectionId) => SECTIONS.findIndex((s) => s.id === id);
