import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConfirmationModal = () => {
  const { confirmModalState, closeConfirmModal } = useApp();

  if (!confirmModalState.isOpen) return null;

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isDanger = false,
    onConfirm,
  } = confirmModalState;

  return (
    <div className="modal-overlay" onClick={closeConfirmModal}>
      <div
        className="modal-container"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDanger ? 'var(--danger-bg)' : 'var(--warning-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDanger ? 'var(--danger)' : 'var(--warning)',
              }}
            >
              {isDanger ? <Trash2 size={18} /> : <AlertTriangle size={18} />}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)' }}>
              {title}
            </h3>
          </div>
          <button
            onClick={closeConfirmModal}
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={closeConfirmModal}>
            {cancelText}
          </button>
          <button
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

