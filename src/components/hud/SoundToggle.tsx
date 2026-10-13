import { Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

/** Bouton son (coupé par défaut, préférence mémorisée). */
export function SoundToggle({ withLabel = false }: { withLabel?: boolean }) {
  const soundOn = useAppStore((s) => s.soundOn);
  const toggle = useAppStore((s) => s.toggleSound);
  return (
    <button
      type="button"
      className="hud-btn"
      onClick={toggle}
      aria-pressed={soundOn}
      aria-label={soundOn ? 'Couper le son' : 'Activer le son'}
      data-cursor={soundOn ? 'MUTE' : 'SOUND'}
    >
      {soundOn ? (
        <Volume2 size={16} aria-hidden="true" />
      ) : (
        <VolumeX size={16} aria-hidden="true" />
      )}
      {withLabel && <span>{soundOn ? 'SON ON' : 'SON OFF'}</span>}
      <span className={`hud-btn__eq ${soundOn ? 'is-on' : ''}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
