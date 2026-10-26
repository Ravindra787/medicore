import React, { useState } from 'react';
import {
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Download,
  Calendar,
  Activity,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, formatTime12h, getLocalDateString } from '../utils/dateUtils';

export const HistoryView = () => {
  const { medicines, doseLogs, activities } = useApp();

  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMedId, setSelectedMedId] = useState('all');

  // Convert doseLogs map to an array of log items
  const allLogKeys = Object.keys(doseLogs);
  const logEntries = allLogKeys
    .map((key) => {
      const log = doseLogs[key];
      const [medId, date, time] = key.split('_');
      const med = medicines.find((m) => m.id === medId) || {
        name: 'Archived Medicine',
        dosage: '',
      };
      return {
        id: key,
        medId,
        medicineName: med.name,
        dosage: med.dosage,
        date: log.date || date,
        time: log.doseTime || time,
        status: log.status,
        timestamp: log.timestamp,
      };
    })
    .filter((entry) => entry.status !== 'pending') // Only show taken or skipped logs
    .sort((a, b) => {
      // Sort newest first
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

  // Apply filters
  const filteredLogs = logEntries.filter((log) => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (selectedMedId !== 'all' && log.medId !== selectedMedId) return false;
    return true;
  });

  // Calculate cumulative stats
  const totalCompletedRecords = logEntries.length;
  const totalTakenRecords = logEntries.filter((l) => l.status === 'taken').length;
  const totalSkippedRecords = logEntries.filter((l) => l.status === 'skipped').length;
  const overallAdherence =
    totalCompletedRecords > 0
      ? Math.round((totalTakenRecords / totalCompletedRecords) * 100)
      : 0;

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'Date,Time,Medicine,Dosage,Status,RecordedTimestamp\n';
    filteredLogs.forEach((l) => {
      csvContent += `"${l.date}","${l.time}","${l.medicineName}","${l.dosage}","${l.status}","${l.timestamp || ''}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mediremind_history_${getLocalDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-view">
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">Adherence History & Logs</h1>
          <p className="welcome-subtitle">
            Comprehensive audit trail of past medication intakes and adherence metrics
          </p>
        </div>

        <button className="btn btn-outline" onClick={handleExportCSV}>
          <Download size={15} /> Export CSV Report
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="metric-card purple">
          <div className="metric-info">
            <span className="metric-label">Historical Adherence</span>
            <span className="metric-value">{overallAdherence}%</span>
            <span className="metric-hint">Overall intake success</span>
          </div>
          <div className="metric-icon-box purple">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="metric-card teal">
          <div className="metric-info">
            <span className="metric-label">Total Taken</span>
            <span className="metric-value">{totalTakenRecords}</span>
            <span className="metric-hint">Confirmed doses</span>
          </div>
          <div className="metric-icon-box teal">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="metric-card rose">
          <div className="metric-info">
            <span className="metric-label">Total Skipped</span>
            <span className="metric-value">{totalSkippedRecords}</span>
            <span className="metric-hint">Missed or skipped doses</span>
          </div>
          <div className="metric-icon-box rose">
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="metric-card amber">
          <div className="metric-info">
            <span className="metric-label">Total Log Entries</span>
            <span className="metric-value">{totalCompletedRecords}</span>
            <span className="metric-hint">Recorded timestamps</span>
          </div>
          <div className="metric-icon-box amber">
            <History size={22} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Status:
            </span>
            {['all', 'taken', 'skipped'].map((s) => (
              <button
                key={s}
                className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
                style={{ textTransform: 'capitalize' }}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Filter Medicine:
            </span>
            <select
              value={selectedMedId}
              onChange={(e) => setSelectedMedId(e.target.value)}
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="all">All Medications</option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          Medication Intake Records ({filteredLogs.length})
        </h3>

        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-box">
              <History size={28} />
            </div>
            <h4 className="empty-title">No history records found</h4>
            <p className="empty-desc">
              When you mark doses as taken or skipped from Today's Schedule, they will be logged here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <th style={{ padding: '12px 14px' }}>Date</th>
                  <th style={{ padding: '12px 14px' }}>Scheduled Time</th>
                  <th style={{ padding: '12px 14px' }}>Medication</th>
                  <th style={{ padding: '12px 14px' }}>Dosage</th>
                  <th style={{ padding: '12px 14px' }}>Status</th>
                  <th style={{ padding: '12px 14px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => {
                  const isTaken = log.status === 'taken';
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid rgba(38, 49, 72, 0.4)',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {formatDisplayDate(log.date)}
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 600 }}>
                        {formatTime12h(log.time)}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {log.medicineName}
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                        {log.dosage}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span className={`badge badge-${log.status}`}>
                          {isTaken ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          <span style={{ textTransform: 'capitalize' }}>{log.status}</span>
                        </span>
                      </td>
                      <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Recorded'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

