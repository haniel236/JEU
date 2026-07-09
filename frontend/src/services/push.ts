// Abonnement aux notifications push (Web Push) — fonctionne même app fermée sur Android.
import { pushApi } from './endpoints.js';

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function notificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  return navigator.serviceWorker.ready;
}

export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  return Boolean(sub);
}

/**
 * Active les notifications push : demande l'autorisation, crée l'abonnement
 * et l'enregistre côté serveur. Retourne un statut explicite.
 */
export async function enablePush(): Promise<
  'enabled' | 'denied' | 'unsupported' | 'unavailable'
> {
  if (!pushSupported()) return 'unsupported';

  const { publicKey } = await pushApi.publicKey();
  if (!publicKey) return 'unavailable';

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const reg = await getRegistration();
  if (!reg) return 'unsupported';

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await pushApi.subscribe(sub.toJSON());
  return 'enabled';
}

export async function disablePush(): Promise<void> {
  const reg = await getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => undefined);
    await pushApi.unsubscribe(endpoint).catch(() => undefined);
  }
}
