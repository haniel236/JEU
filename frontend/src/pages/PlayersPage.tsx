import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Search } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { playerApi } from '../services/endpoints.js';
import { PageHeader } from '../components/PageHeader.js';
import { CardSkeleton } from '../components/Skeleton.js';
import { EmptyState } from '../components/EmptyState.js';
import { Avatar } from '../components/Avatar.js';
import { RankBadge } from '../components/RankBadge.js';
import { formatDate } from '../utils/format.js';

export function PlayersPage() {
  const { groupId } = useGroup();
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['players', groupId],
    queryFn: () => playerApi.list(groupId),
  });

  const players = (data ?? []).filter((p) =>
    p.pseudo.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Joueurs" subtitle={`${data?.length ?? 0} membres dans le groupe`} />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrer par pseudo..."
          className="input pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : players.length === 0 ? (
        <EmptyState icon={Users} title="Aucun joueur" description="Invitez des membres avec le code du groupe." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <Link
              key={p.id}
              to={`/g/${groupId}/players/${p.id}`}
              className="card card-hover flex flex-col gap-3 p-5"
            >
              <div className="flex items-center gap-3">
                <Avatar name={p.pseudo} src={p.photoUrl} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-slate-100">{p.pseudo}</p>
                    {p.role === 'ADMIN' && (
                      <span className="badge bg-brand-500/15 text-brand-300">Admin</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">
                    Depuis {formatDate(p.joinedAt)}
                  </p>
                </div>
                {p.rank && <RankBadge rank={p.rank} />}
              </div>

              <div className="grid grid-cols-4 gap-2 border-t border-surface-700 pt-3 text-center">
                <div>
                  <p className="text-xs text-slate-500">Matchs</p>
                  <p className="font-semibold text-slate-200">{p.matchesPlayed}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">V</p>
                  <p className="font-semibold text-brand-400">{p.wins}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">D</p>
                  <p className="font-semibold text-red-400">{p.losses}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">%</p>
                  <p className="font-semibold text-slate-200">{p.winRate}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
