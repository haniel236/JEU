import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Swords,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Trophy,
  PlusCircle,
  History,
} from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { groupApi } from '../services/endpoints.js';
import { StatCard } from '../components/StatCard.js';
import { CardSkeleton } from '../components/Skeleton.js';
import { PageHeader } from '../components/PageHeader.js';
import { RankBadge } from '../components/RankBadge.js';
import { Avatar } from '../components/Avatar.js';
import { MatchRow } from '../components/MatchRow.js';
import { EmptyState } from '../components/EmptyState.js';

export function DashboardPage() {
  const { groupId } = useGroup();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', groupId],
    queryFn: () => groupApi.dashboard(groupId),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tableau de bord"
        subtitle="Les statistiques ne mentent jamais."
        action={
          <Link to={`/g/${groupId}/record`} className="btn-primary">
            <PlusCircle className="h-4 w-4" /> Enregistrer un match
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Joueurs" value={data!.counts.players} icon={Users} />
            <StatCard label="Matchs (total)" value={data!.counts.totalMatches} icon={Swords} />
            <StatCard label="Aujourd'hui" value={data!.counts.today} icon={CalendarDays} />
            <StatCard label="Cette semaine" value={data!.counts.week} icon={CalendarRange} />
            <StatCard label="Ce mois" value={data!.counts.month} icon={CalendarClock} />
            <StatCard label="Cette année" value={data!.counts.year} icon={CalendarClock} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Top 10 */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Trophy className="h-5 w-5 text-brand-600" /> Top 10
            </h2>
            <Link to={`/g/${groupId}/rankings`} className="text-sm text-brand-600 hover:underline">
              Classement complet
            </Link>
          </div>
          {isLoading ? (
            <CardSkeleton />
          ) : data!.top.length === 0 ? (
            <EmptyState icon={Trophy} title="Aucun classement" description="Enregistrez des matchs pour voir apparaître le top." />
          ) : (
            <div className="space-y-1.5">
              {data!.top.map((p) => (
                <Link
                  key={p.membershipId}
                  to={`/g/${groupId}/players/${p.membershipId}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-800"
                >
                  <RankBadge rank={p.rank} />
                  <Avatar name={p.pseudo} src={p.photoUrl} size="sm" />
                  <span className="flex-1 truncate font-medium text-slate-800">{p.pseudo}</span>
                  <span className="text-sm text-slate-600">{p.winRate}%</span>
                  <span className="w-14 text-right text-sm font-semibold text-brand-600">
                    {p.wins} V
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Derniers matchs */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <History className="h-5 w-5 text-brand-600" /> Derniers matchs
            </h2>
            <Link to={`/g/${groupId}/history`} className="text-sm text-brand-600 hover:underline">
              Tout l'historique
            </Link>
          </div>
          {isLoading ? (
            <CardSkeleton />
          ) : data!.recentMatches.length === 0 ? (
            <EmptyState icon={History} title="Aucun match" description="Le premier match écrira l'histoire du groupe." />
          ) : (
            <div className="space-y-2">
              {data!.recentMatches.map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
