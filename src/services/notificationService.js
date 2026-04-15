/**
 * Notification Service
 * Manages browser notification permissions and triggers.
 * Audio is lazy-loaded only when first needed to avoid network request on startup.
 */

const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
let audio = null; // Lazy-loaded on first use

function getAudio() {
  if (!audio) {
    audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.preload = 'none'; // Don't prefetch until played
  }
  return audio;
}

export const notificationService = {
  /**
   * Request browser notification permissions
   */
  requestPermission: async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return false;
    }

    if (Notification.permission === 'granted') return true;

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  /**
   * Play the notification sound — audio only fetched on first play
   */
  playSound: () => {
    getAudio().currentTime = 0;
    getAudio().play().catch(err => console.warn('Audio playback failed:', err));
  },

  /**
   * Trigger a native browser notification
   */
  notify: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
      });
    }
  }
};
