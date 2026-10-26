// Storage service for MediRemind with LocalStorage persistence

const STORAGE_KEYS = {
  MEDICINES: 'mediremind_medicines',
  DOSE_LOGS: 'mediremind_dose_logs',
  ACTIVITIES: 'mediremind_activities',
  SETTINGS: 'mediremind_settings',
  INITIALIZED: 'mediremind_initialized_v1',
};

// Helper: Format date as YYYY-MM-DD in local time
export const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Initial realistic sample medicines
export const SAMPLE_MEDICINES = [
  {
    id: 'demo-med-1',
    name: 'Amoxicillin',
    dosage: '500 mg (1 capsule)',
    type: 'capsule',
    instructions: 'after_food',
    startDate: getLocalDateString(new Date(Date.now() - 7 * 86400000)),
    endDate: getLocalDateString(new Date(Date.now() + 7 * 86400000)),
    times: ['08:00', '14:00', '20:00'],
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    notes: 'Prescribed for bacterial infection. Complete the full 14-day course.',
    color: '#8B7CFF',
    isDemo: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'demo-med-2',
    name: 'Metformin HCl',
    dosage: '850 mg (1 tablet)',
    type: 'tablet',
    instructions: 'with_food',
    startDate: getLocalDateString(new Date(Date.now() - 30 * 86400000)),
    endDate: '',
    times: ['08:30', '20:30'],
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    notes: 'For blood sugar control. Take strictly during or right after main meals.',
    color: '#39D6B4',
    isDemo: true,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'demo-med-3',
    name: 'Vitamin D3 & K2',
    dosage: '2000 IU (4 drops)',
    type: 'drops',
    instructions: 'after_food',
    startDate: getLocalDateString(new Date(Date.now() - 14 * 86400000)),
    endDate: '',
    times: ['09:00'],
    frequency: 'selected_days',
    days: ['Mon', 'Wed', 'Fri'],
    notes: 'Fat soluble vitamin. Best taken with healthy morning fats.',
    color: '#FFBE55',
    isDemo: true,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'demo-med-4',
    name: 'Cetirizine',
    dosage: '10 mg (1 tablet)',
    type: 'tablet',
    instructions: 'before_food',
    startDate: getLocalDateString(new Date(Date.now() - 10 * 86400000)),
    endDate: '',
    times: ['21:30'],
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    notes: 'For seasonal allergies. May cause mild drowsiness.',
    color: '#FF6B81',
    isDemo: true,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'demo-med-5',
    name: 'Salbutamol Inhaler',
    dosage: '100 mcg (2 puffs)',
    type: 'inhaler',
    instructions: 'anytime',
    startDate: getLocalDateString(new Date(Date.now() - 20 * 86400000)),
    endDate: '',
    times: ['07:30', '19:30'],
    frequency: 'daily',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    notes: 'Rinse mouth with water after inhalation.',
    color: '#38BDF8',
    isDemo: true,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

// Generate seed dose logs for the last 7 days so adherence charts are populated
export const generateSampleLogs = () => {
  const logs = {};
  const todayStr = getLocalDateString();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = getLocalDateString(d);
    const dayName = dayNames[d.getDay()];

    SAMPLE_MEDICINES.forEach((med) => {
      // Check if medicine applies on this date
      const isDayActive =
        med.frequency === 'daily' || (med.days && med.days.includes(dayName));
      if (!isDayActive) return;

      med.times.forEach((time) => {
        const key = `${med.id}_${dateStr}_${time}`;

        if (dateStr === todayStr) {
          // For today, mark early morning doses as taken, afternoon/evening as pending
          const [h] = time.split(':').map(Number);
          const currentH = new Date().getHours();
          if (h < currentH) {
            logs[key] = {
              status: 'taken',
              timestamp: new Date(`${dateStr}T${time}:00`).toISOString(),
              doseTime: time,
              medId: med.id,
              date: dateStr,
            };
          } else {
            logs[key] = {
              status: 'pending',
              timestamp: null,
              doseTime: time,
              medId: med.id,
              date: dateStr,
            };
          }
        } else {
          // Past days: mostly taken (90%), occasionally skipped
          const isTaken = Math.random() > 0.12;
          logs[key] = {
            status: isTaken ? 'taken' : 'skipped',
            timestamp: new Date(`${dateStr}T${time}:00`).toISOString(),
            doseTime: time,
            medId: med.id,
            date: dateStr,
          };
        }
      });
    });
  }

  return logs;
};

export const SAMPLE_ACTIVITIES = [
  {
    id: 'act-1',
    medicineName: 'Amoxicillin',
    action: 'taken',
    time: '08:05 AM',
    date: getLocalDateString(),
    dosage: '500 mg (1 capsule)',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'act-2',
    medicineName: 'Metformin HCl',
    action: 'taken',
    time: '08:35 AM',
    date: getLocalDateString(),
    dosage: '850 mg (1 tablet)',
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: 'act-3',
    medicineName: 'Salbutamol Inhaler',
    action: 'taken',
    time: '07:35 AM',
    date: getLocalDateString(),
    dosage: '100 mcg (2 puffs)',
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

export const DEFAULT_SETTINGS = {
  userName: 'Alex Parker',
  userEmail: 'alex.parker@example.com',
  soundEnabled: true,
  browserNotifications: false,
  reminderLeadTime: 0, // minutes before
  compactView: false,
};

// Storage API methods
export const storageService = {
  initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDemo();
    }
  },

  getMedicines() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMedicines(medicines) {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  },

  getDoseLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveDoseLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
  },

  getActivities() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveActivities(activities) {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVITIES,
      JSON.stringify(activities.slice(0, 50))
    );
  },

  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  resetToDemo() {
    const demoLogs = generateSampleLogs();
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(SAMPLE_MEDICINES));
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(demoLogs));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SAMPLE_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    return {
      medicines: SAMPLE_MEDICINES,
      doseLogs: demoLogs,
      activities: SAMPLE_ACTIVITIES,
      settings: DEFAULT_SETTINGS,
    };
  },

  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.MEDICINES);
    localStorage.removeItem(STORAGE_KEYS.DOSE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    return {
      medicines: [],
      doseLogs: {},
      activities: [],
      settings: this.getSettings(),
    };
  },

  exportData() {
    return JSON.stringify(
      {
        medicines: this.getMedicines(),
        doseLogs: this.getDoseLogs(),
        activities: this.getActivities(),
        settings: this.getSettings(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      },
      null,
      2
    );
  },

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.medicines && Array.isArray(parsed.medicines)) {
        this.saveMedicines(parsed.medicines);
        if (parsed.doseLogs) this.saveDoseLogs(parsed.doseLogs);
        if (parsed.activities) this.saveActivities(parsed.activities);
        if (parsed.settings) this.saveSettings(parsed.settings);
        return { success: true, data: parsed };
      }
      return { success: false, error: 'Invalid data format. "medicines" array missing.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
};

