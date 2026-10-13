import { useAppStore } from '../../store/useAppStore';

const SEGMENTS = 32;

/** Barre d'XP segmentée = progression du scroll. */
export function XPBar() {
  const xp = useAppStore((s) => s.xp);
  const filled = Math.round((xp / 100) * SEGMENTS);
  return (
    <div
      className="xpbar"
      role="progressbar"
      aria-label="Progression dans la page"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={xp}
    >
      <div className="xpbar__track" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <i key={i} className={i < filled ? 'is-on' : ''} />
        ))}
      </div>
      <span className="xpbar__label" aria-hidden="true">
        XP {String(xp).padStart(2, '0')}%
      </span>
    </div>
  );
}
