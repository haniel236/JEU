// Utilitaires de notification côté navigateur : permission, son et notification système.
// Aucun asset externe n'est requis (le son est généré via Web Audio API).

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notificationPermission(): NotificationPermission {
  return notificationsSupported() ? Notification.permission : 'denied';
}

/// Demande la permission d'afficher des notifications système (idempotent).
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/// Joue un court signal sonore agréable (deux tons) sans fichier audio.
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const tones = [
      { freq: 880, start: 0, dur: 0.14 },
      { freq: 1244, start: 0.12, dur: 0.2 },
    ];
    for (const { freq, start, dur } of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = now + start;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    }
    master.gain.setValueAtTime(1, now);
    // Ferme le contexte une fois le son terminé pour libérer les ressources.
    window.setTimeout(() => ctx.close().catch(() => undefined), 800);
  } catch {
    // Son best-effort : on ignore toute erreur (autoplay bloqué, etc.).
  }
}

/// Affiche une notification système si la permission est accordée.
export function showBrowserNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== 'granted') return;
  try {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag: 'zmj-notification',
    });
  } catch {
    // Ignore (contexte non sécurisé, etc.).
  }
}
