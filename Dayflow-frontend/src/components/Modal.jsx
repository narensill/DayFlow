import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IconClose } from './Icons';

export default function Modal({ title, onClose, children, width }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal glass-strong" style={width ? { maxWidth: width } : undefined}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose width="18" height="18" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Delete', danger = true, onConfirm, onClose, loading }) {
  return (
    <Modal title={title} onClose={onClose} width="400px">
      <p className="text-muted" style={{ marginBottom: 22, lineHeight: 1.6 }}>{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
