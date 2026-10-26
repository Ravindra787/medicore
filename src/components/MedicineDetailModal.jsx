import React from 'react';
import {
  X,
  Pill,
  Clock,
  Calendar,
  Utensils,
  FileText,
  Edit2,
  Trash2,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, formatTime12h } from '../utils/dateUtils';

export const MedicineDetailModal = () => {
  const {
    viewingMedicine,
    closeViewModal,
    openEditModal,
    promptConfirm,
    deleteMedicine,
  } = useApp();

  if (!viewingMedicine) return null;

  const med = viewingMedicine;

  const handleDelete = () => {
    closeViewModal();
    promptConfirm({
      title: `Delete ${med.name}?`,
      message: `Are you sure you want to remove ${med.name} from your medication schedule? This action cannot be undone.`,
      confirmText: 'Delete Medicine',
      isDanger: true,
      onConfirm: () => deleteMedicine(med.id),
    });
  };

  const handleEdit = () => {
    closeViewModal();
    openEditModal(med);
  };

  const getFoodInstructionText = (inst) => {
    switch (inst) {
      case 'before_food':
        return 'Take before meals (empty stomach)';
      case 'after_food':
        return 'Take after meals (full stomach)';
      case 'with_food':
        return 'Take along with meals';
      default:
        return 'Anytime (with or without food)';
    }
  };

  return (
    <div className="modal-overlay" onClick={closeViewModal}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: `${med.color || '#8B7CFF'}22`,
                border: `1px solid ${med.color || '#8B7CFF'}55`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: med.color || 'var(--primary)',
              }}
            >
              <Pill size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)' }}>
                  {med.name}
                </h3>
                {med.isDemo && <span className="badge badge-demo">Demo Data</span>}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {med.dosage} • <span style={{ textTransform: 'capitalize' }}>{med.type}</span>
              </p>
            </div>
          </div>
          <button onClick={closeViewModal} style={{ color: 'var(--text-muted)' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '18px' }}>
          {/* Schedule & Reminder Times */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={14} color="var(--primary)" /> Reminder Schedule
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {med.times && med.times.length > 0 ? (
                med.times.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(139, 124, 255, 0.15)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(139, 124, 255, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                    }}
                  >
                    {formatTime12h(t)}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No times set</span>
              )}
            </div>

            <div
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <strong>Frequency:</strong>{' '}
              {med.frequency === 'daily'
                ? 'Every day'
                : `Specific days: ${med.days ? med.days.join(', ') : 'None'}`}
            </div>
          </div>

          {/* Food Instructions */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--warning-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning)',
                flexShrink: 0,
              }}
            >
              <Utensils size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Meal Instructions
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                {getFoodInstructionText(med.instructions)}
              </div>
            </div>
          </div>

          {/* Course Duration */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38BDF8',
                flexShrink: 0,
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Course Duration
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                Started on {formatDisplayDate(med.startDate)}
                {med.endDate ? ` • Until ${formatDisplayDate(med.endDate)}` : ' • Ongoing / Long-term'}
              </div>
            </div>
          </div>

          {/* Notes */}
          {med.notes && (
            <div
              style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={14} /> Doctor's Instructions & Notes
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {med.notes}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={15} /> Delete Medicine
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-outline btn-sm" onClick={closeViewModal}>
              Close
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleEdit}>
              <Edit2 size={15} /> Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

