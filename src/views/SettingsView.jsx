import React, { useState, useRef } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Database,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  User,
  Sparkles,
  Check,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundService } from '../services/sound';
import { storageService } from '../services/storage';

export const SettingsView = () => {
  const {
    settings,
    updateSettings,
    resetToDemo,
    clearAllData,
    promptConfirm,
    showToast,
    requestNotificationPermission,
    triggerTestReminder,
  } = useApp();

  const [userName, setUserName] = useState(settings.userName || 'Alex Parker');
  const [userEmail, setUserEmail] = useState(settings.userEmail || 'alex.parker@example.com');
  const fileInputRef = useRef(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateSettings({ userName, userEmail });
  };

  const handleToggleSound = () => {
    const nextVal = !settings.soundEnabled;
    updateSettings({ soundEnabled: nextVal });
    if (nextVal) {
      soundService.playSuccessChime();
    }
  };

  const handleTestSound = () => {
    soundService.playReminderChime();
    showToast('Sound Test', 'Synthesizer chime played.', 'info');
  };

  const handleResetDemo = () => {
    promptConfirm({
      title: 'Reset to Sample Data?',
      message: 'This will replace current medications and logs with the default sample dataset for evaluation.',
      confirmText: 'Reset Demo Data',
      isDanger: false,
      onConfirm: resetToDemo,
    });
  };

  const handleClearAll = () => {
    promptConfirm({
      title: 'Clear All Data?',
      message: 'This will permanently remove all your medications, reminder times, and adherence logs from browser storage. Are you sure?',
      confirmText: 'Clear Everything',
      isDanger: true,
      onConfirm: clearAllData,
    });
  };

  const handleExportBackup = () => {
    const dataStr = storageService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mediremind_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Successful', 'Data downloaded as a JSON file.', 'success');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = storageService.importData(content);
      if (res.success) {
        showToast('Import Successful', 'Reloading imported data...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast('Import Failed', res.error, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="settings-view">
      <div className="welcome-header">
        <div>
          <h1 className="welcome-title">Settings & Preferences</h1>
          <p className="welcome-subtitle">
            Configure reminders, notification channels, data backup, and user profile
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* User Profile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(139, 124, 255, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={18} />
            </div>
            <div>
              <h3 className="card-title">User Profile</h3>
              <p className="card-subtitle">Personalize greetings and dashboard labels</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-row" style={{ marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={14} /> Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Notifications & Sound Controls */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(57, 214, 180, 0.15)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 className="card-title">Reminders & Sound Alerts</h3>
              <p className="card-subtitle">
                Fine-tune in-browser notifications, audio chimes, and test alerts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Browser Notifications */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  Browser Desktop Notifications
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Receive system alerts when doses are due, even if browser tab is backgrounded
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={requestNotificationPermission}
                >
                  <Bell size={13} />
                  {settings.browserNotifications ? 'Notifications Active' : 'Enable Notifications'}
                </button>
              </div>
            </div>

            {/* Sound Chimes */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                  Audio Chime & Sound Effects
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Pleasant synthesizer bell when dose becomes due or action is confirmed
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="btn btn-outline btn-sm" onClick={handleTestSound}>
                  <Volume2 size={13} /> Test Chime
                </button>
                <button
                  className={`btn ${settings.soundEnabled ? 'btn-primary' : 'btn-outline'} btn-sm`}
                  onClick={handleToggleSound}
                >
                  {settings.soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  {settings.soundEnabled ? 'Sound On' : 'Muted'}
                </button>
              </div>
            </div>

            {/* Immediate Test Alert */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: 'rgba(139, 124, 255, 0.06)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(139, 124, 255, 0.25)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>
                  Test Full Reminder Alert
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Triggers sound, browser notification, and the in-app due reminder popup dialog
                </div>
              </div>

              <button className="btn btn-primary btn-sm" onClick={triggerTestReminder}>
                <Sparkles size={13} /> Trigger Test Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Local Storage & Data Management */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 190, 85, 0.15)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={18} />
            </div>
            <div>
              <h3 className="card-title">Data Management & Persistence</h3>
              <p className="card-subtitle">
                All data resides securely in browser LocalStorage. Backup or reset anytime.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                Sample Demo Data
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Restore realistic sample prescriptions, schedules, and 7-day adherence charts.
              </p>
              <button className="btn btn-secondary btn-sm" onClick={handleResetDemo}>
                <RefreshCw size={13} /> Reset to Demo Data
              </button>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>
                Backup & Restore
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Export your medication regimen as JSON or restore from an existing file.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-outline btn-sm" onClick={handleExportBackup}>
                  <Download size={13} /> Export JSON
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".json"
                  onChange={handleImportFile}
                />
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} /> Import JSON
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 107, 129, 0.3)',
                backgroundColor: 'rgba(255, 107, 129, 0.04)',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)', marginBottom: '4px' }}>
                Danger Zone
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Wipe all saved medicines, dose logs, and activity streams from this browser.
              </p>
              <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
                <Trash2 size={13} /> Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Project & Submission Info Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 22, 37, 0.8) 0%, rgba(21, 28, 44, 0.8) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={18} color="var(--primary)" />
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
              MediRemind — Academic Project Specifications
            </h4>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Designed as a high-fidelity, client-side healthcare dashboard. Fully compliant with
            offline execution requirements: 100% browser-based state simulation via Web
            LocalStorage, Web Audio API synthesis (no external MP3 dependencies), Native HTML5
            Notification API, and responsive desktop/mobile dark theme styling.
          </p>
        </div>
      </div>
    </div>
  );
};

