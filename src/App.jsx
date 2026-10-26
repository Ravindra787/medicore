import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ToastContainer } from './components/ToastContainer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ReminderModal } from './components/ReminderModal';
import { MedicineModal } from './components/MedicineModal';
import { MedicineDetailModal } from './components/MedicineDetailModal';

import { DashboardView } from './views/DashboardView';
import { MedicinesView } from './views/MedicinesView';
import { ScheduleView } from './views/ScheduleView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';

const MainLayout = () => {
  const { activeTab } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'medicines':
        return <MedicinesView />;
      case 'schedule':
        return <ScheduleView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <TopNavbar />
        <main className="page-content">{renderActiveView()}</main>
      </div>

      {/* Global Modals & Notifications */}
      <MedicineModal />
      <MedicineDetailModal />
      <ReminderModal />
      <ConfirmationModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
