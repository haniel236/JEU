import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationApi } from '../services/endpoints.js';
import { getSocket } from '../services/socket.js';
import {
  playNotificationSound,
  requestNotificationPermission,
  showBrowserNotification,
} from '../utils/notify.js';
import type { AppNotification } from '../types/index.js';

export function useNotifications(groupId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', groupId],
    queryFn: () => notificationApi.list(groupId),
    enabled: Boolean(groupId),
  });

  // Demande la permission des notifications système (best-effort, une seule fois).
  useEffect(() => {
    void requestNotificationPermission();
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

      playNotificationSound();
      toast(notification.title, { icon: '🔔' });
      // Notification système lorsque l'onglet n'est pas au premier plan.
      if (typeof document !== 'undefined' && document.hidden) {
        showBrowserNotification(notification.title, notification.message);
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
