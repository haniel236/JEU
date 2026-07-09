import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationApi } from '../services/endpoints.js';
import { getSocket } from '../services/socket.js';
import {
  announceNotification,
  ensureNotificationPermission,
  primeAudio,
} from '../utils/notify.js';
import type { AppNotification } from '../types/index.js';

// Le hook peut être monté plusieurs fois (topbar + page) : on évite de traiter
// deux fois la même notification (double toast / double son).
const seenNotificationIds = new Set<string>();
function markSeen(id: string): boolean {
  if (seenNotificationIds.has(id)) return false;
  seenNotificationIds.add(id);
  setTimeout(() => seenNotificationIds.delete(id), 10_000);
  return true;
}

export function useNotifications(groupId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', groupId],
    queryFn: () => notificationApi.list(groupId),
    enabled: Boolean(groupId),
  });

  // Débloque l'audio et demande la permission au premier geste utilisateur.
  useEffect(() => {
    void ensureNotificationPermission();

    const onFirstGesture = () => {
      primeAudio();
      void ensureNotificationPermission();
    };
    window.addEventListener('pointerdown', onFirstGesture, { once: true });
    window.addEventListener('keydown', onFirstGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
    };
  }, []);

  // Rejoint la room du groupe et écoute les notifications temps réel.
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !groupId) return;

    const join = () => socket.emit('group:join', groupId);
    join();
    socket.on('connect', join);

    const onNew = (notification: AppNotification) => {
      if (notification.groupId !== groupId) return;
      if (markSeen(notification.id)) {
        toast(notification.title, { icon: '🔔' });
        announceNotification(notification.title, notification.message);
      }
      queryClient.invalidateQueries({ queryKey: ['notifications', groupId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
      queryClient.invalidateQueries({ queryKey: ['matches', groupId] });
      queryClient.invalidateQueries({ queryKey: ['rankings', groupId] });
      queryClient.invalidateQueries({ queryKey: ['players', groupId] });
    };

    socket.on('notification:new', onNew);
    return () => {
      socket.emit('group:leave', groupId);
      socket.off('notification:new', onNew);
      socket.off('connect', join);
    };
  }, [groupId, queryClient]);

  return query;
}
