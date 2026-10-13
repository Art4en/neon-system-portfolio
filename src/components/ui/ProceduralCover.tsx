import { useMemo } from 'react';
import { seededRandom } from '../../lib/pixelFont';
import type { Rarity } from '../../content/portfolio';
import { RARITY_COLOR } from '../../lib/rarity';

/**
 * Visuel procédural de remplacement quand public/projects/<slug>/cover.* n'existe pas :
 * sol en grille en perspective + forme filaire unique (déterministe selon le slug).
 */
export function ProceduralCover({
  seed,
  rarity,
  className = '',
}: {
  seed: string;
  rarity: Rarity;
  className?: string;
}) {
  const color = RARITY_COLOR[rarity];
  const art = useMemo(() => {
    const rnd = seededRandom(seed);
    const sides = 3 + Math.floor(rnd() * 4);
    const rings = 2 + Math.floor(rnd() * 3);
    const rot = rnd() * Math.PI;
    const shapes = Array.from({ length: rings }, (_, r) => {
      const radius = 34 - r * (24 / rings);
      const pts = Array.from({ length: sides }, (_, i) => {
        const a = rot + r * 0.4 + (i / sides) * Math.PI * 2;
        return `${(160 + Math.cos(a) * radius * 1.6).toFixed(1)},${(78 + Math.sin(a) * radius).toFixed(1)}`;
      });
      return pts.join(' ');
    });
    const bars = Array.from({ length: 14 }, () => 4 + rnd() * 22);
    return { shapes, bars, sun: rnd() > 0.5 };
  }, [seed]);

  const gid = `pc-${seed}`;
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#090b16" />
          <stop offset="55%" stopColor="#140a2a" />
          <stop offset="100%" stopColor="#05060a" />
        </linearGradient>
        <linearGradient id={`${gid}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE600" />
          <stop offset="100%" stopColor="#FF2BD6" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${gid}-bg)`} />
      {art.sun && (
        <g opacity="0.85">
          <circle cx="160" cy="98" r="40" fill={`url(#${gid}-sun)`} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="110" y={102 + i * 7} width="100" height={1.5 + i} fill="#140a2a" />
          ))}
        </g>
      )}
      <g fill="none" stroke={color} strokeWidth="1" opacity="0.9">
        {art.shapes.map((pts, i) => (
          <polygon key={i} points={pts} opacity={1 - i * 0.2} />
        ))}
      </g>
      {/* sol en perspective */}
      <rect y="118" width="320" height="62" fill="#05060a" />
      <g stroke="#00F0FF" strokeWidth="0.6" opacity="0.55">
        {Array.from({ length: 17 }, (_, i) => (
          <line key={`v${i}`} x1={160 + (i - 8) * 6} y1="118" x2={160 + (i - 8) * 60} y2="180" />
        ))}
        {[0, 3, 7, 13, 21, 31, 44, 60].map((d, i) => (
          <line key={`h${i}`} x1="0" y1={118 + d} x2="320" y2={118 + d} />
        ))}
      </g>
      <line x1="0" y1="118" x2="320" y2="118" stroke="#FF2BD6" strokeWidth="1" opacity="0.8" />
      <g fill={color} opacity="0.5">
        {art.bars.map((h, i) => (
          <rect key={i} x={10 + i * 4} y={14 + 26 - h} width="2" height={h} />
        ))}
      </g>
    </svg>
  );
}
