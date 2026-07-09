import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellRing,
  Swords,
  UserPlus,
  Crown,
  Award,
  BarChart3,
  Check,
  X,
  CheckCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { notificationApi } from '../services/endpoints.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';
import { CardSkeleton } from '../components/Skeleton.js';
import { relativeTime } from '../utils/format.js';
import { cn } from '../utils/cn.js';
import {
  notificationPermission,
  notificationsSupported,
  playNotificationSound,
  requestNotificationPermission,
} from '../utils/notify.js';
import type { NotificationType } from '../types/index.js';

const icons: Record<NotificationType, LucideIcon> = {
  NEW_MATCH: Swords,
  NEW_PLAYER: UserPlus,
  NEW_NUMBER_ONE: Crown,
  NEW_RECORD: Award,
  RANKING_CHANGED: BarChart3,
  JOIN_REQUEST: UserPlus,
  REQUEST_ACCEPTED: Check,
  REQUEST_REJECTED: X,
};

export function NotificationsPage() {
  const { groupId } = useGroup();
  const queryClient = useQueryClient();
  const { data, isLoading } = useNotifications(groupId);
  const [permission, setPermission] = useState(notificationPermission());

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') playNotificationSound();
  };

  const markAll = useMutation({
    mutationFn: () => notificationApi.markAllRead(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', groupId] }),
  });

  const markOne = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(groupId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', groupId] }),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notifications"
        subtitle="Tout ce qui se passe dans votre groupe, en temps réel."
        action={
          (data?.unread ?? 0) > 0 ? (
            <button onClick={() => markAll.mutate()} className="btn-secondary">
              <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
            </button>
          ) : undefined
        }
      />

      {notificationsSupported() && permission !== 'granted' && (
        <div className="card mb-4 flex flex-col gap-3 border-brand-600/30 bg-brand-500/5 p-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-surface-800 p-2.5 text-brand-600">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Activer les notifications</p>
              <p className="text-sm text-slate-600">
                {permission === 'denied'
                  ? 'Les notifications sont bloquées. Autorisez-les dans les réglages de votre navigateur.'
                  : 'Recevez une alerte sonore et une notification à chaque nouveau match ou record.'}
              </p>
            </div>
          </div>
          {permission !== 'denied' && (
            <button onClick={enableNotifications} className="btn-primary shrink-0 sm:ml-auto">
              <BellRing className="h-4 w-4" /> Activer
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.items.length ? (
        <EmptyState icon={Bell} title="Aucune notification" description="Vous serez prévenu à chaque nouveau match ou record." />
      ) : (
        <div className="space-y-2">
          {data.items.map((n) => {
            const Icon = icons[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markOne.mutate(n.id)}
                className={cn(
                  'card flex cursor-pointer items-start gap-3 p-4 transition-colors',
                  !n.read && 'border-brand-600/40 bg-brand-500/5',
                )}
              >
                <div className="rounded-xl bg-surface-800 p-2.5 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-600">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{relativeTime(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
