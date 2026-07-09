// Notifications navigateur robustes : permission, son et bannière système.
// Le son est délégué au moteur audio unique (utils/sound.ts) afin d'éviter
// deux systèmes de son concurrents et de partager le même réglage de coupure.

import { isMuted, playSound, setMuted, unlockAudio } from './sound.js';

let permissionRequested = false;

function supportsNotifications(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/// Le son est activé par défaut ; l'utilisateur peut le couper.
export function isSoundEnabled(): boolean {
  return !isMuted();
}

export function setSoundEnabled(enabled: boolean): void {
  setMuted(!enabled);
}

/// Demande la permission d'afficher des notifications (idempotent, silencieux).
export async function ensureNotificationPermission(): Promise<NotificationPermission> {
  if (!supportsNotifications()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  if (permissionRequested) return Notification.permission;
  permissionRequested = true;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/// Débloque l'audio (les navigateurs exigent un geste utilisateur au préalable).
export function primeAudio(): void {
  unlockAudio();
}

/// Joue le son de notification via le moteur audio partagé.
export function playNotificationSound(): void {
  playSound('notify');
}

/// Affiche une bannière système si la permission est accordée.
export function showBrowserNotification(title: string, body?: string): void {
  if (!supportsNotifications() || Notification.permission !== 'granted') return;
  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'zmj-notification',
      renotify: true,
    } as NotificationOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch {
    // Certains navigateurs limitent les notifications hors HTTPS ; on ignore.
  }
}

/// Signale une nouvelle notification : son + bannière système (best-effort).
export function announceNotification(title: string, body?: string): void {
  playNotificationSound();
  showBrowserNotification(title, body);
}
