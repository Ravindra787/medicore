import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  storageService,
  getLocalDateString,
} from '../services/storage';
import { soundService } from '../services/sound';
import { notificationService } from '../services/notification';
import {
  getDosesForDate,
  calculateDayMetrics,
  formatTime12h,
} from '../utils/dateUtils';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Core state from storage
  const [medicines, setMedicines] = useState([]);
  const [doseLogs, setDoseLogs] = useState({});
  const [activities, setActivities] = useState([]);
  const [settings, setSettings] = useState(storageService.getSettings());

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [viewingMedicine, setViewingMedicine] = useState(null);
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    onConfirm: null,
  });

  // Active reminder alert modal
  const [activeReminder, setActiveReminder] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Track notified dose keys during current session to avoid annoying duplicate alerts
  const notifiedKeysRef = useRef(new Set());

  // Toast notification helper
  const showToast = useCallback((title, message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize data on mount
  useEffect(() => {
    storageService.initialize();
    setMedicines(storageService.getMedicines());
    setDoseLogs(storageService.getDoseLogs());
    setActivities(storageService.getActivities());
    setSettings(storageService.getSettings());
  }, []);

  // Confetti trigger helper
  const triggerCelebration = useCallback(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B7CFF', '#39D6B4', '#FFBE55', '#FF6B81', '#38BDF8'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Dose status management
  const setDoseStatus = useCallback(
    (medId, date, time, newStatus) => {
      const key = `${medId}_${date}_${time}`;
      const med = medicines.find((m) => m.id === medId);
      const prevLog = doseLogs[key];
      const prevStatus = prevLog?.status || 'pending';

      const updatedLogs = {
        ...doseLogs,
        [key]: {
          status: newStatus,
          timestamp: newStatus === 'pending' ? null : new Date().toISOString(),
          doseTime: time,
          medId,
          date,
        },
      };

      setDoseLogs(updatedLogs);
      storageService.saveDoseLogs(updatedLogs);

      // Create activity log
      if (med && newStatus !== prevStatus) {
        let actionWord = '';
        if (newStatus === 'taken') actionWord = 'marked as taken';
        else if (newStatus === 'skipped') actionWord = 'marked as skipped';
        else actionWord = 'reverted to pending';

        const newActivity = {
          id: 'act-' + Date.now(),
          medicineName: med.name,
          action: newStatus,
          time: formatTime12h(time),
          date,
          dosage: med.dosage,
          timestamp: new Date().toISOString(),
        };

        const updatedActivities = [newActivity, ...activities].slice(0, 50);
        setActivities(updatedActivities);
        storageService.saveActivities(updatedActivities);

        if (newStatus === 'taken') {
          if (settings.soundEnabled) {
            soundService.playSuccessChime();
          }
          showToast(
            'Dose Recorded',
            `Marked ${med.name} (${formatTime12h(time)}) as taken.`,
            'success'
          );

          // Check if all today's doses are now taken!
          const todayStr = getLocalDateString();
          if (date === todayStr) {
            const todayDoses = getDosesForDate(medicines, updatedLogs, todayStr);
            const metrics = calculateDayMetrics(todayDoses);
            if (metrics.total > 0 && metrics.taken === metrics.total) {
              triggerCelebration();
              showToast(
                'Goal Completed! 🎉',
                'All scheduled doses for today have been completed!',
                'success'
              );
            }
          }
        } else if (newStatus === 'skipped') {
          showToast(
            'Dose Skipped',
            `Marked ${med.name} (${formatTime12h(time)}) as skipped.`,
            'warning'
          );
        } else {
          showToast(
            'Status Reset',
            `Reset ${med.name} (${formatTime12h(time)}) back to pending.`,
            'info'
          );
        }
      }
    },
    [medicines, doseLogs, activities, settings.soundEnabled, showToast, triggerCelebration]
  );

  // Medicine CRUD
  const addMedicine = useCallback(
    (medData) => {
      const newMed = {
        ...medData,
        id: 'med-' + Date.now(),
        createdAt: new Date().toISOString(),
        isDemo: false,
      };

      const updated = [newMed, ...medicines];
      setMedicines(updated);
      storageService.saveMedicines(updated);

      const newAct = {
        id: 'act-' + Date.now(),
        medicineName: newMed.name,
        action: 'added',
        time: 'Just now',
        date: getLocalDateString(),
        dosage: newMed.dosage,
        timestamp: new Date().toISOString(),
      };
      const updatedActs = [newAct, ...activities].slice(0, 50);
      setActivities(updatedActs);
      storageService.saveActivities(updatedActs);

      if (settings.soundEnabled) soundService.playSuccessChime();
      showToast('Medicine Added', `"${newMed.name}" has been added to your regimen.`, 'success');
      return newMed;
    },
    [medicines, activities, settings.soundEnabled, showToast]
  );

  const updateMedicine = useCallback(
    (id, updatedData) => {
      const updated = medicines.map((m) => (m.id === id ? { ...m, ...updatedData } : m));
      setMedicines(updated);
      storageService.saveMedicines(updated);

      const newAct = {
        id: 'act-' + Date.now(),
        medicineName: updatedData.name || 'Medicine',
        action: 'updated',
        time: 'Just now',
        date: getLocalDateString(),
        dosage: updatedData.dosage || '',
        timestamp: new Date().toISOString(),
      };
      const updatedActs = [newAct, ...activities].slice(0, 50);
      setActivities(updatedActs);
      storageService.saveActivities(updatedActs);

      showToast('Updated', `Changes to "${updatedData.name}" have been saved.`, 'success');
    },
    [medicines, activities, showToast]
  );

  const deleteMedicine = useCallback(
    (id) => {
      const medToDelete = medicines.find((m) => m.id === id);
      const name = medToDelete ? medToDelete.name : 'Medicine';
      const updated = medicines.filter((m) => m.id !== id);
      setMedicines(updated);
      storageService.saveMedicines(updated);

      const newAct = {
        id: 'act-' + Date.now(),
        medicineName: name,
        action: 'deleted',
        time: 'Just now',
        date: getLocalDateString(),
        dosage: medToDelete?.dosage || '',
        timestamp: new Date().toISOString(),
      };
      const updatedActs = [newAct, ...activities].slice(0, 50);
      setActivities(updatedActs);
      storageService.saveActivities(updatedActs);

      showToast('Deleted', `"${name}" removed from your schedule.`, 'info');
    },
    [medicines, activities, showToast]
  );

  // Settings update
  const updateSettings = useCallback(
    (newSettings) => {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      storageService.saveSettings(merged);
      showToast('Settings Saved', 'Your preferences have been updated.', 'success');
    },
    [settings, showToast]
  );

  // Reset to demo
  const resetToDemo = useCallback(() => {
    const fresh = storageService.resetToDemo();
    setMedicines(fresh.medicines);
    setDoseLogs(fresh.doseLogs);
    setActivities(fresh.activities);
    setSettings(fresh.settings);
    notifiedKeysRef.current.clear();
    showToast('Demo Data Restored', 'Sample medicines and schedule loaded.', 'info');
  }, [showToast]);

  // Clear all data
  const clearAllData = useCallback(() => {
    const cleared = storageService.clearAllData();
    setMedicines(cleared.medicines);
    setDoseLogs(cleared.doseLogs);
    setActivities(cleared.activities);
    notifiedKeysRef.current.clear();
    showToast('Data Cleared', 'All medication records have been cleared.', 'warning');
  }, [showToast]);

  // Request browser notifications permission
  const requestNotificationPermission = useCallback(async () => {
    const result = await notificationService.requestPermission();
    if (result.granted) {
      updateSettings({ browserNotifications: true });
      showToast('Notifications Enabled', 'Browser notifications are now active.', 'success');
      notificationService.sendNotification('MediRemind Notifications Active', {
        body: 'You will receive timely alerts for your scheduled medications.',
      });
    } else {
      updateSettings({ browserNotifications: false });
      showToast(
        'Permission Denied',
        'Could not enable browser notifications. In-app alerts remain active.',
        'warning'
      );
    }
  }, [updateSettings, showToast]);

  // Test notification helper
  const triggerTestReminder = useCallback(() => {
    const sampleMed = medicines[0] || {
      name: 'Amoxicillin',
      dosage: '500 mg',
      instructions: 'after_food',
    };
    if (settings.soundEnabled) soundService.playReminderChime();
    notificationService.sendNotification(`Reminder: Time for ${sampleMed.name}`, {
      body: `Dosage: ${sampleMed.dosage} — Please take as prescribed.`,
    });
    setActiveReminder({
      medicine: sampleMed,
      time: 'Now',
      date: getLocalDateString(),
      isTest: true,
    });
    showToast('Test Reminder Triggered', 'Notification and chime sent successfully.', 'info');
  }, [medicines, settings.soundEnabled, showToast]);

  // Periodic Reminder Checker: runs every 15 seconds to check if any dose is due right now
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = getLocalDateString(now);

      const todayDoses = getDosesForDate(medicines, doseLogs, todayStr);

      todayDoses.forEach((dose) => {
        // Compare dose time with current time (e.g. within current minute)
        if (dose.time === currentTimeStr && dose.status === 'pending') {
          const reminderKey = `${dose.id}_reminder_${todayStr}`;
          if (!notifiedKeysRef.current.has(reminderKey)) {
            notifiedKeysRef.current.add(reminderKey);

            // Play sound if enabled
            if (settings.soundEnabled) {
              soundService.playReminderChime();
            }

            // Native browser notification if enabled
            if (settings.browserNotifications) {
              notificationService.sendNotification(`Time for ${dose.medicine.name}`, {
                body: `Dose: ${dose.medicine.dosage} (${formatTime12h(dose.time)}). Food: ${dose.medicine.instructions.replace('_', ' ')}`,
              });
            }

            // In-app alert modal
            setActiveReminder({
              ...dose,
              isTest: false,
            });
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [medicines, doseLogs, settings.soundEnabled, settings.browserNotifications]);

  // Confirmation modal helper
  const promptConfirm = useCallback(
    ({ title, message, onConfirm, confirmText = 'Confirm', isDanger = false }) => {
      setConfirmModalState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText: 'Cancel',
        isDanger,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    []
  );

  const closeConfirmModal = useCallback(() => {
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openAddModal = useCallback(() => {
    setEditingMedicine(null);
    setIsMedicineModalOpen(true);
  }, []);

  const openEditModal = useCallback((medicine) => {
    setEditingMedicine(medicine);
    setIsMedicineModalOpen(true);
  }, []);

  const closeMedicineModal = useCallback(() => {
    setIsMedicineModalOpen(false);
    setEditingMedicine(null);
  }, []);

  const openViewModal = useCallback((medicine) => {
    setViewingMedicine(medicine);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewingMedicine(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        medicines,
        doseLogs,
        activities,
        settings,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        sidebarCollapsed,
        setSidebarCollapsed,
        mobileMenuOpen,
        setMobileMenuOpen,
        // Modals
        isMedicineModalOpen,
        editingMedicine,
        viewingMedicine,
        openAddModal,
        openEditModal,
        closeMedicineModal,
        openViewModal,
        closeViewModal,
        confirmModalState,
        promptConfirm,
        closeConfirmModal,
        // Active in-app reminder
        activeReminder,
        setActiveReminder,
        // Toasts
        toasts,
        showToast,
        removeToast,
        // CRUD & Operations
        addMedicine,
        updateMedicine,
        deleteMedicine,
        setDoseStatus,
        updateSettings,
        resetToDemo,
        clearAllData,
        requestNotificationPermission,
        triggerTestReminder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

