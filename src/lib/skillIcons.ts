import { Braces, Gamepad2, Monitor, Server, Wrench, type LucideIcon } from 'lucide-react';
import type { SkillCategoryId } from '../content/portfolio';

/** Icône de chaque catégorie de compétences. */
export const CATEGORY_ICONS: Record<SkillCategoryId, LucideIcon> = {
  languages: Braces,
  front: Monitor,
  back: Server,
  tools: Wrench,
  gamedev: Gamepad2,
};
