import { useMemo } from 'react';
import { pixelText, seededRandom } from '../../lib/pixelFont';

/** Avatar néon généré : identicon symétrique + initiales en pixel art (quand public/avatar.jpg est absent). */
export function GeneratedAvatar({
  seed,
  initials,
  className = '',
}: {
  seed: string;
  initials: string;
  className?: string;
}) {
  const { cells, letters, lw } = useMemo(() => {
    const rnd = seededRandom(seed);
    const cells: [number, number][] = [];
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 5; x++)
        if (rnd() > 0.55) {
          cells.push([x, y]);
          cells.push([9 - x, y]);
        }
    const t = pixelText(initials.slice(0, 2) || 'P1');
    return { cells, letters: t.pixels, lw: t.width };
  }, [seed, initials]);

  const scale = 5.2;
  const ox = 50 - (lw * scale) / 2;
  const oy = 50 - (7 * scale) / 2;

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Avatar généré">
      <defs>
        <radialGradient id="av-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1a1040" />
          <stop offset="100%" stopColor="#05060a" />
        </radialGradient>
        <filter id="av-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" fill="url(#av-bg)" />
      <g fill="var(--neon-violet)" opacity="0.45">
        {cells.map(([x, y], i) => (
          <rect key={i} x={x * 10 + 1} y={y * 10 + 1} width="8" height="8" />
        ))}
      </g>
      <g fill="var(--accent)" filter="url(#av-glow)">
        {letters.map(([x, y], i) => (
          <rect
            key={i}
            x={ox + x * scale}
            y={oy + y * scale}
            width={scale - 0.6}
            height={scale - 0.6}
          />
        ))}
      </g>
    </svg>
  );
}
