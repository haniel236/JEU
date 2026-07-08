import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { matchApi, playerApi } from '../services/endpoints.js';
import { PageLoader } from '../components/Spinner.js';
import { Avatar } from '../components/Avatar.js';
import { MatchRow } from '../components/MatchRow.js';
import { EmptyState } from '../components/EmptyState.js';
import type { StatBucket } from '../types/index.js';

function StatBlock({ title, stat }: { title: string; stat: StatBucket }) {
  return (
    <div className="card p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900">{stat.played}</p>
          <p className="text-xs text-slate-500">Matchs</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-brand-600">{stat.winRate}%</p>
          <p className="text-xs text-slate-500">Victoires</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-brand-600">{stat.wins}</p>
          <p className="text-xs text-slate-500">Gagnés</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-red-400">{stat.losses}</p>
          <p className="text-xs text-slate-500">Perdus</p>
        </div>
      </div>
    </div>
  );
}

export function PlayerProfilePage() {
  const { groupId } = useGroup();
  const { membershipId = '' } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['player', groupId, membershipId],
    queryFn: () => playerApi.detail(groupId, membershipId),
  });

  const { data: matches } = useQuery({
    queryKey: ['matches', groupId, { playerId: membershipId }],
    queryFn: () => matchApi.list(groupId, { playerId: membershipId, pageSize: 20 }),
    enabled: Boolean(membershipId),
  });

  if (isLoading || !data) return <PageLoader />;

  const { player, stats } = data;

  return (
    <div className="animate-fade-in">
      <Link to={`/g/${groupId}/players`} className="btn-ghost mb-4 !px-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Joueurs
      </Link>

      <div className="card mb-6 flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
        <Avatar name={player.pseudo} src={player.photoUrl} size="xl" />
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold text-slate-900">{player.pseudo}</h1>
            {player.role === 'ADMIN' && (
              <span className="badge bg-brand-500/15 text-brand-700">Admin</span>
            )}
          </div>
          <p className="text-sm text-slate-600">{player.user.name}</p>
        </div>
        {player.rank && (
          <div className="sm:ml-auto flex items-center gap-2 rounded-xl bg-surface-800 px-4 py-2">
            <Trophy className="h-5 w-5 text-brand-600" />
            <span className="text-sm text-slate-600">Rang</span>
            <span className="text-xl font-bold text-slate-900">#{player.rank}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock title="Général" stat={stats.all} />
        <StatBlock title="Cette semaine" stat={stats.week} />
        <StatBlock title="Ce mois" stat={stats.month} />
        <StatBlock title="Cette année" stat={stats.year} />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Historique des matchs</h2>
        {!matches?.items.length ? (
          <EmptyState icon={Trophy} title="Aucun match" description="Ce joueur n'a pas encore joué." />
        ) : (
          <div className="space-y-2">
            {matches.items.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
