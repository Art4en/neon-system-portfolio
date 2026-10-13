import { QUALITIES, useAppStore, type Quality } from '../../store/useAppStore';
import { sfx } from '../../audio/synth';

const LABEL: Record<Quality, string> = { low: 'LOW', medium: 'MED', high: 'HIGH', ultra: 'ULTRA' };

/** Sélecteur de qualité graphique LOW / MED / HIGH / ULTRA (AUTO tant que non modifié). */
export function QualityToggle({ compact = false }: { compact?: boolean }) {
  const quality = useAppStore((s) => s.quality);
  const auto = useAppStore((s) => s.qualityAuto);
  const setQuality = useAppStore((s) => s.setQuality);

  if (compact) {
    const next = QUALITIES[(QUALITIES.indexOf(quality) + 1) % QUALITIES.length];
    return (
      <button
        type="button"
        className="hud-btn"
        onClick={() => {
          sfx.blip();
          setQuality(next, true);
        }}
        aria-label={`Qualité graphique : ${LABEL[quality]}. Passer en ${LABEL[next]}`}
      >
        <span className="font-mono text-[0.65rem] tracking-widest">GFX {LABEL[quality]}</span>
      </button>
    );
  }

  return (
    <div className="quality" role="radiogroup" aria-label="Qualité graphique">
      {auto && (
        <span className="quality__auto micro" title="Qualité ajustée automatiquement selon les FPS">
          AUTO
        </span>
      )}
      {QUALITIES.map((q) => (
        <button
          key={q}
          type="button"
          role="radio"
          aria-checked={quality === q}
          className={`quality__opt ${quality === q ? 'is-active' : ''}`}
          onClick={() => {
            sfx.blip();
            setQuality(q, true);
          }}
          onPointerEnter={() => sfx.hover()}
        >
          {LABEL[q]}
        </button>
      ))}
    </div>
  );
}
