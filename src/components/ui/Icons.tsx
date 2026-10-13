import {
  Bike,
  BookOpen,
  Box,
  Brush,
  Camera,
  ChefHat,
  Code2,
  Coffee,
  Cpu,
  Dices,
  Dumbbell,
  Film,
  Gamepad2,
  Globe,
  Guitar,
  Headphones,
  Mountain,
  Music,
  Palette,
  PenTool,
  Plane,
  Rocket,
  Swords,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { InventoryIcon, SocialPlatform } from '../../content/portfolio';
import { SOCIALS } from '../../lib/socials';

const INVENTORY: Record<InventoryIcon, LucideIcon> = {
  box: Box,
  gamepad: Gamepad2,
  music: Music,
  headphones: Headphones,
  guitar: Guitar,
  book: BookOpen,
  pen: PenTool,
  camera: Camera,
  film: Film,
  palette: Palette,
  brush: Brush,
  code: Code2,
  cpu: Cpu,
  rocket: Rocket,
  mountain: Mountain,
  bike: Bike,
  dumbbell: Dumbbell,
  trophy: Trophy,
  plane: Plane,
  globe: Globe,
  coffee: Coffee,
  chef: ChefHat,
  dice: Dices,
  swords: Swords,
};

export function InventoryGlyph({ icon, size = 26 }: { icon: InventoryIcon; size?: number }) {
  const Icon = INVENTORY[icon] ?? Box;
  return <Icon size={size} strokeWidth={1.6} aria-hidden="true" />;
}

export function SocialIcon({ platform, size = 22 }: { platform: SocialPlatform; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={SOCIALS[platform].path} />
    </svg>
  );
}
