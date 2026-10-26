import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  Volume2,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString, getDosesForDate, formatTime12h } from '../utils/dateUtils';

export const TopNavbar = () => {
  const {
    settings,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    setMobileMenuOpen,
    medicines,
    doseLogs,
    triggerTestReminder,
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifMenuRef = useRef(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const todayStr = getLocalDateString();
  const todayDoses = getDosesForDate(medicines, doseLogs, todayStr);
  const pendingDoses = todayDoses.filter((d) => d.status === 'pending');

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (activeTab !== 'medicines' && e.target.value.trim().length > 0) {
      setActiveTab('medicines');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search medicines, dosages..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="navbar-right">
        {/* Live Date & Time */}
        <div className="current-datetime">
          <span className="current-date-text">{formattedDate}</span>
          <span className="current-time-text">{formattedTime}</span>
        </div>

        {/* Notifications & Reminders Dropdown */}
        <div style={{ position: 'relative' }} ref={notifMenuRef}>
          <button
            className="nav-icon-btn"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title="Notifications & reminders"
          >
            <Bell size={18} />
            {pendingDoses.length > 0 && <span className="notification-dot" />}
          </button>

          {showNotifMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '320px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                padding: '16px',
                animation: 'scaleUp 0.15s ease-out',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>
                    Reminders & Alerts
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: pendingDoses.length > 0 ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: pendingDoses.length > 0 ? 'var(--warning)' : 'var(--success)',
                    fontWeight: 700,
                  }}
                >
                  {pendingDoses.length} Due Today
                </span>
              </div>

              {pendingDoses.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Next pending medications:
                  </p>
                  {pendingDoses.slice(0, 3).map((dose) => (
                    <div
                      key={dose.id}
                      style={{
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>
                          {dose.medicine.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {dose.medicine.dosage}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--primary)',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                        }}
                      >
                        {formatTime12h(dose.time)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--success)' }}>
                  <CheckCircle2 size={24} style={{ margin: '0 auto 6px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600 }}>All caught up for today!</p>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <button
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    triggerTestReminder();
                    setShowNotifMenu(false);
                  }}
                >
                  <Sparkles size={13} />
                  Test Alert
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setActiveTab('schedule');
                    setShowNotifMenu(false);
                  }}
                >
                  <Calendar size={13} />
                  View Schedule
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div
          className="user-profile-btn"
          onClick={() => setActiveTab('settings')}
          title="Account settings"
        >
          <div className="avatar-circle">{getUserInitials(settings.userName)}</div>
          <span className="user-profile-name">{settings.userName}</span>
        </div>
      </div>
    </header>
  );
};

