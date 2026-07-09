import webpush from 'web-push';
import type { Notification } from '@prisma/client';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

const enabled = Boolean(env.push.publicKey && env.push.privateKey);

if (enabled) {
  webpush.setVapidDetails(env.push.subject, env.push.publicKey, env.push.privateKey);
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[push] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY absents — notifications push désactivées.',
  );
}

export function isPushEnabled(): boolean {
  return enabled;
}

export function getPublicKey(): string | null {
  return enabled ? env.push.publicKey : null;
}

interface BrowserSubscription {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function saveSubscription(
  userId: string,
  sub: BrowserSubscription,
  userAgent?: string,
) {
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return null;
  }
  return prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent,
      userId,
    },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent,
      userId,
    },
  });
}

export async function removeSubscription(endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

async function sendToUsers(userIds: string[], payload: Record<string, unknown>) {
  if (!enabled || userIds.length === 0) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { in: userIds } },
  });
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);
  const stale: string[] = [];

  await Promise.all(
    subscriptions.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body,
        );
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // 404/410 = abonnement expiré : on le nettoie.
        if (statusCode === 404 || statusCode === 410) {
          stale.push(s.endpoint);
        }
      }
    }),
  );

  if (stale.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: stale } } });
  }
}

/// Envoie une notification push aux destinataires concernés.
export async function sendPushForNotification(notification: Notification) {
  if (!enabled) return;

  let userIds: string[];
  if (notification.userId) {
    userIds = [notification.userId];
  } else {
    const members = await prisma.membership.findMany({
      where: { groupId: notification.groupId, status: 'ACCEPTED' },
      select: { userId: true },
    });
    userIds = members.map((m) => m.userId);
  }

  await sendToUsers(userIds, {
    title: notification.title,
    body: notification.message,
    tag: `group-${notification.groupId}`,
    url: `/g/${notification.groupId}/notifications`,
  });
}
