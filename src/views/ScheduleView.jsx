import React, { useState } from 'react';
import {
  CalendarCheck2,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Check,
  X,
  Undo2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  Utensils,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getLocalDateString,
  getDosesForDate,
  calculateDayMetrics,
  formatDisplayDate,
  formatTime12h,
  PERIOD_CONFIG,
} from '../utils/dateUtils';

export const ScheduleView = () => {
  const {
    medicines,
    doseLogs,
    setDoseStatus,
    openViewModal,
    openAddModal,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());

  const todayStr = getLocalDateString();
  const doses = getDosesForDate(medicines, doseLogs, selectedDate);
  const metrics = calculateDayMetrics(doses);

  // Group doses into morning, afternoon, evening, night
  const groupedDoses = {
    morning: doses.filter((d) => d.period === 'morning'),
    afternoon: doses.filter((d) => d.period === 'afternoon'),
    evening: doses.filter((d) => d.period === 'evening'),
    night: doses.filter((d) => d.period === 'night'),
  };

  const changeDateBy = (days) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    setSelectedDate(getLocalDateString(date));
  };

  const getPeriodIcon = (period) => {
    switch (period) {
      case 'morning':
        return <Sunrise size={20} color="#FFBE55" />;
      case 'afternoon':
        return <Sun size={20} color="#38BDF8" />;
      case 'evening':
        return <Sunset size={20} color="#8B7CFF" />;
      case 'night':
        return <Moon size={20} color="#EC4899" />;
      default:
        return <Clock size={20} />;
    }
  };

  return (
    <div className="schedule-view">
      {/* Header and Date Navigation */}
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">Medication Schedule</h1>
          <p className="welcome-subtitle">
            Dose schedule partitioned into Morning, Afternoon, Evening, and Night
          </p>
        </div>

        {/* Date Selector Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-outline btn-icon"
            onClick={() => changeDateBy(-1)}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            className={`btn ${selectedDate === todayStr ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedDate(todayStr)}
          >
            {selectedDate === todayStr ? "Today's Schedule" : 'Jump to Today'}
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '8px 12px' }}
          />

          <button
            className="btn btn-outline btn-icon"
            onClick={() => changeDateBy(1)}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Selected Day Stats Bar */}
      <div
        className="card"
        style={{
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Schedule for:
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
            {formatDisplayDate(selectedDate)} {selectedDate === todayStr && '(Today)'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              SCHEDULED
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
              {metrics.total}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
              TAKEN
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>
              {metrics.taken}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--warning)', fontWeight: 600 }}>
              PENDING
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning)' }}>
              {metrics.pending}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>
              SKIPPED
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)' }}>
              {metrics.skipped}
            </div>
          </div>
        </div>
      </div>

      {/* Doses Grouped by Period */}
      {doses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon-box">
              <CalendarCheck2 size={32} />
            </div>
            <h4 className="empty-title">No doses scheduled for this date</h4>
            <p className="empty-desc">
              Check your medication start/end dates or add a new medicine to this schedule.
            </p>
            <button className="btn btn-primary btn-sm" onClick={openAddModal}>
              <Plus size={14} /> Add Medicine
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {['morning', 'afternoon', 'evening', 'night'].map((periodKey) => {
            const periodDoses = groupedDoses[periodKey];
            const config = PERIOD_CONFIG[periodKey];

            return (
              <div key={periodKey} className="period-group">
                <div className="period-header">
                  <div className="period-title">
                    {getPeriodIcon(periodKey)}
                    <span>{config.label}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {periodDoses.length} {periodDoses.length === 1 ? 'dose' : 'doses'}
                    </span>
                  </div>
                  <span className="period-time-range">{config.timeRange}</span>
                </div>

                {periodDoses.length === 0 ? (
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed var(--border-color)',
                      textAlign: 'center',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    No medications scheduled for this time window
                  </div>
                ) : (
                  <div className="dose-list">
                    {periodDoses.map((dose) => (
                      <div
                        key={dose.id}
                        className={`dose-item-card is-${dose.status}`}
                      >
                        <div className="dose-left">
                          <span className="dose-time-pill">
                            {formatTime12h(dose.time)}
                          </span>
                          <div>
                            <div
                              className="dose-info-title"
                              style={{ cursor: 'pointer' }}
                              onClick={() => openViewModal(dose.medicine)}
                            >
                              {dose.medicine.name}
                              {dose.medicine.isDemo && (
                                <span className="badge badge-demo">Demo</span>
                              )}
                            </div>
                            <div className="dose-info-sub">
                              <span>{dose.medicine.dosage}</span>
                              <span>•</span>
                              <span className="badge badge-food">
                                <Utensils size={11} /> {dose.medicine.instructions.replace('_', ' ')}
                              </span>
                              {dose.medicine.notes && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: 'var(--text-muted)',
                                    maxWidth: '200px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  ({dose.medicine.notes})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="dose-actions">
                          {dose.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  setDoseStatus(dose.medId, dose.date, dose.time, 'taken')
                                }
                                title="Mark as Taken"
                              >
                                <Check size={14} /> Taken
                              </button>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ color: 'var(--text-muted)' }}
                                onClick={() =>
                                  setDoseStatus(dose.medId, dose.date, dose.time, 'skipped')
                                }
                                title="Mark as Skipped"
                              >
                                <X size={14} /> Skip
                              </button>
                            </>
                          )}

                          {dose.status === 'taken' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-taken">
                                <Check size={12} /> Taken
                              </span>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
                                onClick={() =>
                                  setDoseStatus(dose.medId, dose.date, dose.time, 'pending')
                                }
                                title="Revert to pending"
                              >
                                <Undo2 size={12} /> Undo
                              </button>
                            </div>
                          )}

                          {dose.status === 'skipped' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-skipped">
                                <X size={12} /> Skipped
                              </span>
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
                                onClick={() =>
                                  setDoseStatus(dose.medId, dose.date, dose.time, 'pending')
                                }
                                title="Revert to pending"
                              >
                                <Undo2 size={12} /> Undo
                              </button>
                            </div>
                          )}

                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '6px 8px' }}
                            onClick={() => openViewModal(dose.medicine)}
                            title="View medicine details"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

