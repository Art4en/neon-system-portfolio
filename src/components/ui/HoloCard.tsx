import { useRef, type ReactNode } from 'react';
import { useTilt } from '../../hooks/useTilt';
import type { Rarity } from '../../content/portfolio';

interface HoloCardProps {
  rarity: Rarity;
  className?: string;
  children: ReactNode;
}

/** Carte holographique : tilt 3D, reflet irisé qui suit la souris, bordure conique animée. */
export function HoloCard({ rarity, className = '', children }: HoloCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref, { max: 7, scale: 1.015 });
  return (
    <div ref={ref} className={`holo-card rarity-${rarity} ${className}`}>
      <div className="holo-card__border" aria-hidden="true" />
      <div className="holo-card__body">
        {children}
        <div className="holo-card__sheen" aria-hidden="true" />
      </div>
    </div>
  );
}
