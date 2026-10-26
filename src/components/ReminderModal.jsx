import React from 'react';
import { Bell, Check, Clock, Utensils, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime12h, getLocalDateString } from '../utils/dateUtils';

export const ReminderModal = () => {
  const { activeReminder, setActiveReminder, setDoseStatus } = useApp();

  if (!activeReminder) return null;

  const { medicine, time, date, isTest } = activeReminder;

  const handleTakeNow = () => {
    if (medicine && !isTest && time && date) {
      setDoseStatus(medicine.id, date, time, 'taken');
    }
    setActiveReminder(null);
  };

  const handleDismiss = () => {
    setActiveReminder(null);
  };

  const getFoodInstructionText = (inst) => {
    switch (inst) {
      case 'before_food':
        return 'Take before food (empty stomach)';
      case 'after_food':
        return 'Take after food (with full stomach)';
      case 'with_food':
        return 'Take along with your meal';
      default:
        return 'Can be taken anytime';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleDismiss}>
      <div
        className="modal-container"
        style={{
          maxWidth: '460px',
          border: '1px solid var(--primary)',
          boxShadow: '0 0 35px rgba(139, 124, 255, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(90deg, rgba(139, 124, 255, 0.15) 0%, rgba(57, 214, 180, 0.1) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulseGlow 2s infinite',
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)' }}>
                {isTest ? 'Test Reminder Alert' : 'Medication Due Now!'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {isTest ? 'Simulated reminder notification' : 'Scheduled intake reminder'}
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} style={{ color: 'var(--text-muted)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: 'center', padding: '24px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(139, 124, 255, 0.15)',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: 700,
              fontFamily: 'monospace',
              marginBottom: '12px',
            }}
          >
            Scheduled for {time === 'Now' ? 'Now' : formatTime12h(time)}
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
            {medicine?.name}
          </h2>

          <p style={{ fontSize: '15px', color: 'var(--secondary)', fontWeight: 600, marginTop: '4px' }}>
            {medicine?.dosage}
          </p>

          <div
            style={{
              marginTop: '18px',
              padding: '12px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'left',
            }}
          >
            <Utensils size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {getFoodInstructionText(medicine?.instructions)}
            </span>
          </div>

          {medicine?.notes && (
            <p
              style={{
                marginTop: '12px',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}
            >
              "{medicine.notes}"
            </p>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-outline" onClick={handleDismiss}>
            Dismiss
          </button>
          <button className="btn btn-primary" onClick={handleTakeNow}>
            <Check size={16} />
            Mark as Taken
          </button>
        </div>
      </div>
    </div>
  );
};

