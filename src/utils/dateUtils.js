// Date and Dose Utility Functions

export const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const getTimePeriod = (time24) => {
  if (!time24) return 'morning';
  const [hours] = time24.split(':').map(Number);
  if (hours >= 5 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
};

export const PERIOD_CONFIG = {
  morning: {
    label: 'Morning',
    timeRange: '5:00 AM – 11:59 AM',
    color: '#FFBE55',
  },
  afternoon: {
    label: 'Afternoon',
    timeRange: '12:00 PM – 4:59 PM',
    color: '#38BDF8',
  },
  evening: {
    label: 'Evening',
    timeRange: '5:00 PM – 8:59 PM',
    color: '#8B7CFF',
  },
  night: {
    label: 'Night',
    timeRange: '9:00 PM – 4:59 AM',
    color: '#EC4899',
  },
};

export const isMedicineActiveOnDate = (med, dateStr) => {
  if (!med) return false;
  if (med.startDate && dateStr < med.startDate) return false;
  if (med.endDate && dateStr > med.endDate) return false;

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayNames[date.getDay()];

  if (med.frequency === 'selected_days') {
    return Array.isArray(med.days) && med.days.includes(dayName);
  }
  return true; // daily
};

// Generates scheduled doses for a specific date and medicines list
export const getDosesForDate = (medicines, doseLogs, dateStr) => {
  const doses = [];

  medicines.forEach((med) => {
    if (!isMedicineActiveOnDate(med, dateStr)) return;

    const times = Array.isArray(med.times) ? [...med.times].sort() : [];
    times.forEach((time) => {
      const key = `${med.id}_${dateStr}_${time}`;
      const log = doseLogs[key];
      const status = log ? log.status : 'pending';

      doses.push({
        id: key,
        medId: med.id,
        medicine: med,
        date: dateStr,
        time,
        period: getTimePeriod(time),
        status,
        timestamp: log?.timestamp || null,
      });
    });
  });

  // Sort by time ascending
  return doses.sort((a, b) => a.time.localeCompare(b.time));
};

// Calculate adherence metrics for a date
export const calculateDayMetrics = (doses) => {
  const total = doses.length;
  const taken = doses.filter((d) => d.status === 'taken').length;
  const skipped = doses.filter((d) => d.status === 'skipped').length;
  const pending = doses.filter((d) => d.status === 'pending').length;
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

  return { total, taken, skipped, pending, percentage };
};

// Generates 7-day adherence data for Recharts
export const getWeeklyAdherenceData = (medicines, doseLogs) => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = getLocalDateString(d);
    const dayLabel = i === 0 ? 'Today' : `${dayNames[d.getDay()]} ${d.getDate()}`;
    const doses = getDosesForDate(medicines, doseLogs, dateStr);
    const metrics = calculateDayMetrics(doses);

    result.push({
      dateStr,
      day: dayLabel,
      taken: metrics.taken,
      skipped: metrics.skipped,
      pending: metrics.pending,
      total: metrics.total,
      adherence: metrics.percentage,
    });
  }

  return result;
};

