import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { History, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { matchApi } from '../services/endpoints.js';
import { extractError } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { CardSkeleton } from '../components/Skeleton.js';
import { EmptyState } from '../components/EmptyState.js';
import { Avatar } from '../components/Avatar.js';
import { formatDateTime } from '../utils/format.js';
import { cn } from '../utils/cn.js';

export function HistoryPage() {
  const { groupId, isAdmin } = useGroup();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['matches', groupId, { page }],
    queryFn: () => matchApi.list(groupId, { page, pageSize: 15 }),
  });

  const removeMutation = useMutation({
    mutationFn: (matchId: string) => matchApi.remove(groupId, matchId),
    onSuccess: () => {
      toast.success('Match supprimé');
      queryClient.invalidateQueries({ queryKey: ['matches', groupId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
      queryClient.invalidateQueries({ queryKey: ['players', groupId] });
      queryClient.invalidateQueries({ queryKey: ['rankings', groupId] });
    },
    onError: (err) => toast.error(extractError(err)),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Historique" subtitle={`${data?.total ?? 0} matchs enregistrés`} />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : !data?.items.length ? (
        <EmptyState icon={History} title="Aucun match" description="Enregistrez votre premier match." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="hidden grid-cols-12 gap-2 border-b border-surface-700 px-4 py-3 text-xs font-semibold uppercase text-slate-500 sm:grid">
              <div className="col-span-4">Joueur 1</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-4">Joueur 2</div>
              <div className="col-span-2 text-right">Date</div>
            </div>
            {data.items.map((m) => {
              const p1Win = m.winner?.id === m.player1.id;
              const p2Win = m.winner?.id === m.player2.id;
              return (
                <div
                  key={m.id}
                  className="group grid grid-cols-2 items-center gap-2 border-b border-surface-800 px-4 py-3 last:border-0 hover:bg-surface-850/50 sm:grid-cols-12"
                >
                  <div className="col-span-1 flex items-center gap-2 sm:col-span-4">
                    <Avatar name={m.player1.pseudo} src={m.player1.photoUrl} size="sm" />
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-medium', p1Win ? 'text-brand-300' : 'text-slate-200')}>
                        {m.player1.pseudo}
                      </p>
                      <p className="truncate text-xs text-slate-500">{m.team1Name}</p>
                    </div>
                  </div>
                  <div className="col-span-1 text-center sm:col-span-2">
                    <span className="font-bold tabular-nums text-slate-100">
                      {m.score1} - {m.score2}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center gap-2 sm:col-span-4">
                    <Avatar name={m.player2.pseudo} src={m.player2.photoUrl} size="sm" />
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-medium', p2Win ? 'text-brand-300' : 'text-slate-200')}>
                        {m.player2.pseudo}
                      </p>
                      <p className="truncate text-xs text-slate-500">{m.team2Name}</p>
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2 sm:col-span-2">
                    <span className="hidden text-xs text-slate-500 sm:inline">
                      {formatDateTime(m.playedAt)}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('Supprimer ce match ? Les statistiques seront recalculées.')) {
                            removeMutation.mutate(m.id);
                          }
                        }}
                        className="btn-ghost !p-1.5 text-red-400 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary !px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-slate-400">
                Page {data.page} / {data.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="btn-secondary !px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
