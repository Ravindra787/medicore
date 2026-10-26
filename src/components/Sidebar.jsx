import React from 'react';
import {
  LayoutDashboard,
  Pill,
  CalendarCheck2,
  History,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString, getDosesForDate } from '../utils/dateUtils';

export const Sidebar = () => {
  const {
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    medicines,
    doseLogs,
    openAddModal,
  } = useApp();

  const todayStr = getLocalDateString();
  const todayDoses = getDosesForDate(medicines, doseLogs, todayStr);
  const pendingDosesCount = todayDoses.filter((d) => d.status === 'pending').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'medicines',
      label: 'My Medicines',
      icon: Pill,
      badge: medicines.length,
    },
    {
      id: 'schedule',
      label: "Today's Schedule",
      icon: CalendarCheck2,
      badge: pendingDosesCount > 0 ? pendingDosesCount : null,
      badgeWarning: true,
    },
    {
      id: 'history',
      label: 'History & Logs',
      icon: History,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${
          mobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <HeartPulse size={24} />
            </div>
            {!sidebarCollapsed && (
              <span className="brand-name">
                Medi<span className="brand-accent">Remind</span>
              </span>
            )}
          </div>

          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} />
                {!sidebarCollapsed && (
                  <>
                    <span className="nav-label">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className="nav-badge"
                        style={{
                          backgroundColor:
                            item.badgeWarning && item.badge > 0
                              ? 'var(--warning)'
                              : undefined,
                          color:
                            item.badgeWarning && item.badge > 0
                              ? '#0B0F19'
                              : undefined,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            className="quick-add-btn"
            onClick={() => {
              openAddModal();
              setMobileMenuOpen(false);
            }}
            title="Add a new medicine"
          >
            <Plus size={18} />
            {!sidebarCollapsed && <span>Add Medicine</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

