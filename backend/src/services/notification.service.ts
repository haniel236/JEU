import type { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { getIO, groupRoom, userRoom } from '../socket/io.js';

interface CreateNotificationInput {
  groupId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Prisma.InputJsonValue;
  userId?: string | null;
}

/// Crée une notification en base et la diffuse en temps réel via Socket.IO.
export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      groupId: input.groupId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data,
      userId: input.userId ?? null,
    },
  });

  try {
    const io = getIO();
    const target = notification.userId
      ? userRoom(notification.userId)
      : groupRoom(notification.groupId);
    io.to(target).emit('notification:new', notification);
  } catch {
    // Socket non initialisé (ex: tests) — on ignore silencieusement.
  }

  return notification;
}

export async function listNotifications(groupId: string, userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: {
      groupId,
      OR: [{ userId: null }, { userId }],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function countUnread(groupId: string, userId: string) {
  return prisma.notification.count({
    where: {
      groupId,
      read: false,
      OR: [{ userId: null }, { userId }],
    },
  });
}

export async function markAsRead(id: string, groupId: string) {
  await prisma.notification.updateMany({
    where: { id, groupId },
    data: { read: true },
  });
}

export async function markAllAsRead(groupId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { groupId, OR: [{ userId: null }, { userId }] },
    data: { read: true },
  });
}
