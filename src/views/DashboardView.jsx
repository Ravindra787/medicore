import React from 'react';
import {
  Pill,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Plus,
  AlertCircle,
  TrendingUp,
  Activity,
  ChevronRight,
  Sparkles,
  Utensils,
  Undo2,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  getLocalDateString,
  getDosesForDate,
  calculateDayMetrics,
  getWeeklyAdherenceData,
  formatTime12h,
} from '../utils/dateUtils';

export const DashboardView = () => {
  const {
    settings,
    medicines,
    doseLogs,
    activities,
    setDoseStatus,
    openAddModal,
    openViewModal,
    setActiveTab,
  } = useApp();

  const todayStr = getLocalDateString();
  const todayDoses = getDosesForDate(medicines, doseLogs, todayStr);
  const metrics = calculateDayMetrics(todayDoses);
  const weeklyData = getWeeklyAdherenceData(medicines, doseLogs);

  // Time-based personalized greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Find next upcoming pending dose
  const currentHours = new Date().getHours();
  const currentMinutes = new Date().getMinutes();
  const currentTimeMinutes = currentHours * 60 + currentMinutes;

  const upcomingDose = todayDoses.find((dose) => {
    if (dose.status !== 'pending') return false;
    const [h, m] = dose.time.split(':').map(Number);
    const doseTotalMinutes = h * 60 + m;
    return doseTotalMinutes >= currentTimeMinutes - 15; // within last 15 min or upcoming
  }) || todayDoses.find((d) => d.status === 'pending');

  // Adherence encouraging message
  const getAdherenceMessage = (pct) => {
    if (pct === 100) return 'Outstanding! All scheduled doses for today are complete.';
    if (pct >= 75) return 'Great job! You are on track with your medication regimen.';
    if (pct >= 50) return 'Halfway through today\'s schedule. Remember your upcoming doses.';
    if (pct > 0) return 'Good start to the day. Keep following your prescribed schedule.';
    return 'No doses taken yet today. Check your schedule below to stay on track.';
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#101625',
            border: '1px solid #263148',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          <p style={{ fontWeight: 700, fontSize: '13px', color: '#F3F5FA', marginBottom: '6px' }}>
            {label}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px' }}>
            <span style={{ color: '#39D6B4' }}>
              ● Taken: <strong>{payload[0]?.value || 0} doses</strong>
            </span>
            <span style={{ color: '#FF6B81' }}>
              ● Skipped: <strong>{payload[1]?.value || 0} doses</strong>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-view">
      {/* Personalized Greeting Header */}
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">
            {getGreeting()}, {settings.userName || 'Alex'} 👋
          </h1>
          <p className="welcome-subtitle">
            Here is your medication plan and adherence report for today.
          </p>
        </div>

        <div className="header-action-group">
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Add Medicine
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card purple">
          <div className="metric-info">
            <span className="metric-label">Active Medicines</span>
            <span className="metric-value">{medicines.length}</span>
            <span className="metric-hint">Currently in regimen</span>
          </div>
          <div className="metric-icon-box purple">
            <Pill size={22} />
          </div>
        </div>

        <div className="metric-card teal">
          <div className="metric-info">
            <span className="metric-label">Scheduled Today</span>
            <span className="metric-value">{metrics.total}</span>
            <span className="metric-hint">Total doses planned</span>
          </div>
          <div className="metric-icon-box teal">
            <CalendarCheck2 size={22} />
          </div>
        </div>

        <div className="metric-card amber">
          <div className="metric-info">
            <span className="metric-label">Doses Taken</span>
            <span className="metric-value">{metrics.taken}</span>
            <span className="metric-hint" style={{ color: 'var(--success)' }}>
              {metrics.percentage}% adherence rate
            </span>
          </div>
          <div className="metric-icon-box amber">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="metric-card rose">
          <div className="metric-info">
            <span className="metric-label">Pending Doses</span>
            <span className="metric-value">{metrics.pending}</span>
            <span className="metric-hint">Awaiting intake</span>
          </div>
          <div className="metric-icon-box rose">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Daily Adherence Progress Card */}
      <div className="adherence-card">
        <div className="adherence-circle-wrapper">
          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="3.2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#39D6B4"
              strokeWidth="3.2"
              strokeDasharray={`${metrics.percentage}, 100`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div className="adherence-percent-text">{metrics.percentage}%</div>
        </div>

        <div className="adherence-details">
          <div className="adherence-title">
            Today's Adherence Rate: {metrics.taken} of {metrics.total} Doses Taken
          </div>
          <div className="adherence-desc">{getAdherenceMessage(metrics.percentage)}</div>
          <div className="adherence-bar-bg">
            <div className="adherence-bar-fill" style={{ width: `${metrics.percentage}%` }} />
          </div>
        </div>
      </div>

      {/* Main Two Column Section: Left = Schedule & Charts, Right = Next Dose & Activity */}
      <div className="dashboard-main-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today's Schedule Overview */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 className="card-title">Today's Dose Schedule</h3>
                <p className="card-subtitle">Mark doses as taken or skipped in real time</p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setActiveTab('schedule')}
              >
                View Full Schedule <ChevronRight size={14} />
              </button>
            </div>

            {todayDoses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon-box">
                  <Pill size={28} />
                </div>
                <h4 className="empty-title">No doses scheduled for today</h4>
                <p className="empty-desc">
                  Add a medicine or adjust reminder days to generate today's doses.
                </p>
                <button className="btn btn-primary btn-sm" onClick={openAddModal}>
                  <Plus size={14} /> Add Medicine
                </button>
              </div>
            ) : (
              <div className="dose-list">
                {todayDoses.map((dose) => (
                  <div
                    key={dose.id}
                    className={`dose-item-card is-${dose.status}`}
                  >
                    <div className="dose-left">
                      <span className="dose-time-pill">{formatTime12h(dose.time)}</span>
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
                            {dose.medicine.instructions.replace('_', ' ')}
                          </span>
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
                            <CheckCircle2 size={12} /> Taken
                          </span>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
                            onClick={() =>
                              setDoseStatus(dose.medId, dose.date, dose.time, 'pending')
                            }
                            title="Undo taken status"
                          >
                            <Undo2 size={12} /> Undo
                          </button>
                        </div>
                      )}

                      {dose.status === 'skipped' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-skipped">
                            <AlertCircle size={12} /> Skipped
                          </span>
                          <button
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--text-muted)' }}
                            onClick={() =>
                              setDoseStatus(dose.medId, dose.date, dose.time, 'pending')
                            }
                            title="Undo skipped status"
                          >
                            <Undo2 size={12} /> Undo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7-Day Adherence Chart */}
          <div className="card">
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--primary)" />
                <h3 className="card-title">Weekly Adherence History</h3>
              </div>
              <p className="card-subtitle">
                Comparison of taken vs. skipped doses across the past 7 days
              </p>
            </div>

            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#263148" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#9BA7BD"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#263148' }}
                  />
                  <YAxis
                    stroke="#9BA7BD"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#263148' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(value) => (
                      <span style={{ color: '#F3F5FA', textTransform: 'capitalize' }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="taken"
                    name="Taken"
                    fill="#39D6B4"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                  <Bar
                    dataKey="skipped"
                    name="Skipped"
                    fill="#FF6B81"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upcoming Next Dose Alert Card */}
          {upcomingDose ? (
            <div className="upcoming-alert-box">
              <div className="upcoming-header">
                <span className="upcoming-title">
                  <Clock size={15} /> Next Scheduled Dose
                </span>
                <span className="upcoming-time-badge">
                  {formatTime12h(upcomingDose.time)}
                </span>
              </div>

              <div className="upcoming-name">{upcomingDose.medicine.name}</div>
              <div className="upcoming-details">
                {upcomingDose.medicine.dosage} • {upcomingDose.medicine.instructions.replace('_', ' ')}
              </div>

              {upcomingDose.medicine.notes && (
                <div
                  style={{
                    marginTop: '10px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  "{upcomingDose.medicine.notes}"
                </div>
              )}

              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() =>
                    setDoseStatus(
                      upcomingDose.medId,
                      upcomingDose.date,
                      upcomingDose.time,
                      'taken'
                    )
                  }
                >
                  <Check size={14} /> Mark as Taken
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => openViewModal(upcomingDose.medicine)}
                >
                  Details
                </button>
              </div>
            </div>
          ) : (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '24px',
                borderColor: 'var(--secondary)',
                backgroundColor: 'rgba(57, 214, 180, 0.05)',
              }}
            >
              <CheckCircle2 size={36} color="var(--secondary)" style={{ margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                All Doses Completed!
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                You have fulfilled all scheduled medications for today. Excellent consistency!
              </p>
            </div>
          )}

          {/* Recent Activity Log */}
          <div className="card">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--secondary)" />
                <h3 className="card-title">Recent Activity</h3>
              </div>
              <button
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                onClick={() => setActiveTab('history')}
              >
                All Logs
              </button>
            </div>

            {activities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                No recent activity recorded.
              </p>
            ) : (
              <div className="activity-list">
                {activities.slice(0, 5).map((act) => {
                  let dotColor = 'var(--primary)';
                  if (act.action === 'taken') dotColor = 'var(--success)';
                  else if (act.action === 'skipped') dotColor = 'var(--danger)';
                  else if (act.action === 'deleted') dotColor = 'var(--danger)';

                  return (
                    <div key={act.id} className="activity-item">
                      <span className="activity-dot" style={{ backgroundColor: dotColor }} />
                      <div style={{ flex: 1 }}>
                        <div className="activity-text">
                          <strong>{act.medicineName}</strong> was {act.action}
                          {act.dosage && ` (${act.dosage})`}
                        </div>
                        <div className="activity-time">
                          {act.time} • {act.date}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

