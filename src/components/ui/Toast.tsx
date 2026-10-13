import { Trophy, Lock, Zap, Info } from 'lucide-react';
import { useAppStore, type Toast } from '../../store/useAppStore';

const META: Record<Toast['kind'], { label: string; Icon: typeof Trophy }> = {
  achievement: { label: 'Achievement unlocked', Icon: Trophy },
  secret: { label: 'Secret achievement', Icon: Lock },
  milestone: { label: 'Achievement unlocked', Icon: Zap },
  system: { label: 'System', Icon: Info },
};

/** Notifications façon Xbox / Steam (succès débloqués, messages système). */
export function ToastStack() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => {
        const { label, Icon } = META[t.kind];
        return (
          <button
            key={t.id}
            type="button"
            className={`toast toast--${t.kind}`}
            onClick={() => dismiss(t.id)}
            aria-label={`${label} : ${t.title}. Fermer`}
          >
            <span className="toast__icon" aria-hidden="true">
              <Icon size={20} strokeWidth={2.2} />
            </span>
            <span className="toast__text">
              <span className="toast__label">🏆 {label}</span>
              <span className="toast__title">{t.title}</span>
              {t.subtitle && <span className="toast__sub">{t.subtitle}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
