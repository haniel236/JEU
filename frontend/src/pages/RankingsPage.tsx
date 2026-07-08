import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { rankingApi } from '../services/endpoints.js';
import { PageHeader } from '../components/PageHeader.js';
import { CardSkeleton } from '../components/Skeleton.js';
import { EmptyState } from '../components/EmptyState.js';
import { Avatar } from '../components/Avatar.js';
import { RankBadge } from '../components/RankBadge.js';
import { cn } from '../utils/cn.js';

const periods = [
  { key: 'all', label: 'Général' },
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'year', label: 'Année' },
] as const;

type PeriodKey = (typeof periods)[number]['key'];

export function RankingsPage() {
  const { groupId } = useGroup();
  const [period, setPeriod] = useState<PeriodKey>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['rankings', groupId, period],
    queryFn: () => rankingApi.get(groupId, period),
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Classements" subtitle="Victoires, pourcentage et nombre de matchs." />

      <div className="mb-4 inline-flex rounded-xl border border-surface-700 bg-surface-850 p-1">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              period === p.key ? 'bg-brand-500 text-surface-950' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : !data?.length ? (
        <EmptyState icon={Trophy} title="Aucun classement" description="Aucun match sur cette période." />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 border-b border-surface-700 px-4 py-3 text-xs font-semibold uppercase text-slate-500">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Joueur</div>
            <div className="col-span-2 text-center">Matchs</div>
            <div className="col-span-2 text-center">V / D</div>
            <div className="col-span-2 text-right">%</div>
          </div>
          {data.map((row) => (
            <Link
              key={row.membershipId}
              to={`/g/${groupId}/players/${row.membershipId}`}
              className="grid grid-cols-12 items-center gap-2 border-b border-surface-800 px-4 py-3 last:border-0 hover:bg-surface-850/50"
            >
              <div className="col-span-1">
                <RankBadge rank={row.rank} />
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <Avatar name={row.pseudo} src={row.photoUrl} size="sm" />
                <span className="truncate font-medium text-slate-200">{row.pseudo}</span>
              </div>
              <div className="col-span-2 text-center text-slate-300">{row.matchesPlayed}</div>
              <div className="col-span-2 text-center text-sm">
                <span className="text-brand-400">{row.wins}</span>
                <span className="text-slate-600"> / </span>
                <span className="text-red-400">{row.losses}</span>
              </div>
              <div className="col-span-2 text-right font-semibold text-slate-100">{row.winRate}%</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
