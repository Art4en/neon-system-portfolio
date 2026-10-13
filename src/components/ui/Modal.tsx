import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { startScroll, stopScroll } from '../../lib/scroll';

interface ModalProps {
  onClose: () => void;
  /** id du titre de la modale (aria-labelledby). */
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

/**
 * Modale accessible : focus piégé, fermeture avec Échap, focus restauré à la fermeture,
 * scroll de la page bloqué. Le parent la monte / démonte (elle est ouverte tant qu'elle existe).
 */
export function Modal({ onClose, labelledBy, className = '', children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = ref.current;
    stopScroll();
    const items = () =>
      Array.from(el?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
        (n) => n.offsetParent !== null || n === document.activeElement,
      );
    window.setTimeout(() => (items()[0] ?? el)?.focus({ preventScroll: true }), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = items();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      startScroll();
      previous?.focus({ preventScroll: true });
    };
  }, []);

  return createPortal(
    <div
      ref={ref}
      className="modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      tabIndex={-1}
      data-lenis-prevent=""
    >
      <div className="modal-backdrop" onClick={() => closeRef.current()} aria-hidden="true" />
      <div className={`modal-content ${className}`}>{children}</div>
    </div>,
    document.body,
  );
}
