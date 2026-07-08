import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swords } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { playerApi, rankingApi } from '../services/endpoints.js';
import { PageHeader } from '../components/PageHeader.js';
import { EmptyState } from '../components/EmptyState.js';
import { Avatar } from '../components/Avatar.js';
import { MatchRow } from '../components/MatchRow.js';
import { Spinner } from '../components/Spinner.js';

export function HeadToHeadPage() {
  const { groupId } = useGroup();
  const [aId, setAId] = useState('');
  const [bId, setBId] = useState('');

  const { data: players } = useQuery({
    queryKey: ['players', groupId],
    queryFn: () => playerApi.list(groupId),
  });

  const { data, isFetching } = useQuery({
    queryKey: ['h2h', groupId, aId, bId],
    queryFn: () => rankingApi.headToHead(groupId, aId, bId),
    enabled: Boolean(aId && bId && aId !== bId),
  });

  const options = players ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Face-à-Face" subtitle="Comparez deux joueurs et réglez les débats." />

      <div className="card mb-6 grid gap-3 p-5 sm:grid-cols-2">
        <div>
          <label className="label">Joueur A</label>
          <select value={aId} onChange={(e) => setAId(e.target.value)} className="input">
            <option value="">Sélectionner...</option>
            {options.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === bId}>
                {p.pseudo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Joueur B</label>
          <select value={bId} onChange={(e) => setBId(e.target.value)} className="input">
            <option value="">Sélectionner...</option>
            {options.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === aId}>
                {p.pseudo}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!aId || !bId ? (
        <EmptyState
          icon={Swords}
          title="Sélectionnez deux joueurs"
          description="Choisissez deux joueurs pour voir leurs confrontations directes."
        />
      ) : isFetching ? (
        <div className="flex justify-center py-10">
          <Spinner className="h-8 w-8" />
        </div>
      ) : data ? (
        <>
          <div className="card mb-6 p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-1 flex-col items-center gap-2">
                <Avatar name={data.playerA.pseudo} src={data.playerA.photoUrl} size="xl" />
                <p className="font-semibold text-slate-900">{data.playerA.pseudo}</p>
                <p className="text-4xl font-bold text-brand-600">{data.playerA.wins}</p>
                <p className="text-xs text-slate-500">{data.playerA.winRate}% · {data.playerA.goals} buts</p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs uppercase text-slate-500">Confrontations</span>
                <span className="text-3xl font-bold text-slate-900">{data.totalMatches}</span>
                <span className="text-xs text-slate-500">{data.draws} nul(s)</span>
              </div>

              <div className="flex flex-1 flex-col items-center gap-2">
                <Avatar name={data.playerB.pseudo} src={data.playerB.photoUrl} size="xl" />
                <p className="font-semibold text-slate-900">{data.playerB.pseudo}</p>
                <p className="text-4xl font-bold text-brand-600">{data.playerB.wins}</p>
                <p className="text-xs text-slate-500">{data.playerB.winRate}% · {data.playerB.goals} buts</p>
              </div>
            </div>

            {/* Barre de domination */}
            {data.totalMatches > 0 && (
              <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-surface-700">
                <div
                  className="bg-brand-500"
                  style={{ width: `${(data.playerA.wins / data.totalMatches) * 100}%` }}
                />
                <div
                  className="bg-slate-500"
                  style={{ width: `${(data.draws / data.totalMatches) * 100}%` }}
                />
                <div
                  className="bg-brand-300"
                  style={{ width: `${(data.playerB.wins / data.totalMatches) * 100}%` }}
                />
              </div>
            )}
          </div>

          <h2 className="mb-3 text-lg font-semibold text-slate-900">Historique complet</h2>
          {data.matches.length === 0 ? (
            <EmptyState icon={Swords} title="Aucune confrontation" description="Ces deux joueurs ne se sont jamais affrontés." />
          ) : (
            <div className="space-y-2">
              {data.matches.map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
