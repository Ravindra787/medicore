// Browser Notification helper for MediRemind

export const notificationService = {
  isSupported() {
    return 'Notification' in window;
  },

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission() {
    if (!this.isSupported()) {
      return { granted: false, error: 'Notifications are not supported in this browser' };
    }
    try {
      const permission = await Notification.requestPermission();
      return { granted: permission === 'granted', permission };
    } catch (e) {
      return { granted: false, error: e.message };
    }
  },

  sendNotification(title, options = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }
    try {
      const notif = new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200],
        ...options,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
      return true;
    } catch (e) {
      console.warn('Native notification failed:', e);
      return false;
    }
  },
};

