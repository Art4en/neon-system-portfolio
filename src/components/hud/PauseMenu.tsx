import { useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { isTouch } from '../../lib/env';
import { disableGyro, enableGyro, gyroSupported } from '../../lib/gyro';
import { SECTIONS } from '../../lib/sections';
import { useAppStore } from '../../store/useAppStore';
import { scrollToTarget } from '../../lib/scroll';
import { sfx } from '../../audio/synth';
import { Modal } from '../ui/Modal';
import { SoundToggle } from './SoundToggle';
import { QualityToggle } from './QualityToggle';

/** Menu plein écran façon « menu pause » (mobile, ou bouton PAUSE). */
export function PauseMenu() {
  const open = useAppStore((s) => s.menuOpen);
  const setOpen = useAppStore((s) => s.setMenuOpen);
  const active = useAppStore((s) => s.activeIndex);
  const gyro = useAppStore((s) => s.gyro);
  const setGyro = useAppStore((s) => s.setGyro);
  const [gyroError, setGyroError] = useState(false);
  if (!open) return null;

  const toggleGyro = async () => {
    if (gyro) {
      disableGyro();
      setGyro(false);
      return;
    }
    const ok = await enableGyro();
    setGyro(ok);
    setGyroError(!ok);
  };

  const close = () => setOpen(false);
  const go = (id: string) => {
    sfx.blip();
    close();
    if (id !== 'resume') window.setTimeout(() => scrollToTarget(id, { duration: 1.4 }), 80);
  };

  return (
    <Modal onClose={close} labelledBy="pause-title" className="pause">
      <div className="pause__head">
        <p className="micro">// GAME PAUSED · LVL {SECTIONS[active].num}</p>
        <button type="button" className="hud-btn" onClick={close} aria-label="Fermer le menu">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <h2 id="pause-title" className="h-display glow-text pause__title">
        Pause
      </h2>
      <nav aria-label="Menu pause">
        <ul className="pause__list">
          <li>
            <button type="button" onClick={() => go('resume')} onPointerEnter={() => sfx.hover()}>
              <span>▶</span> Resume
            </button>
          </li>
          {SECTIONS.filter((s) => s.id !== 'hero').map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => go(s.id)}
                onPointerEnter={() => sfx.hover()}
                className={SECTIONS[active].id === s.id ? 'is-active' : ''}
              >
                <span>{s.num}</span> {s.pause}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="pause__settings">
        <p className="micro mb-3">// OPTIONS</p>
        <div className="flex flex-wrap items-center gap-3">
          <SoundToggle withLabel />
          <QualityToggle />
          {isTouch && gyroSupported() && (
            <button type="button" className="hud-btn" onClick={toggleGyro} aria-pressed={gyro}>
              <Smartphone size={16} aria-hidden="true" /> {gyro ? 'GYRO ON' : 'GYRO OFF'}
            </button>
          )}
        </div>
        {gyroError && (
          <p className="micro mt-3 text-neon-yellow">Gyroscope non autorisé ou indisponible.</p>
        )}
      </div>
    </Modal>
  );
}
