import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { PlusCircle, Minus, Plus, Trophy } from 'lucide-react';
import { useGroup } from '../context/GroupContext.js';
import { matchApi, playerApi } from '../services/endpoints.js';
import { extractError } from '../services/api.js';
import { PageHeader } from '../components/PageHeader.js';
import { Spinner } from '../components/Spinner.js';
import { cn } from '../utils/cn.js';

function ScoreStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="btn-secondary !px-3 !py-2"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={0}
        max={99}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(99, Number(e.target.value))))}
        className="input w-16 text-center text-2xl font-bold"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(99, value + 1))}
        className="btn-secondary !px-3 !py-2"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function RecordMatchPage() {
  const { groupId } = useGroup();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: players } = useQuery({
    queryKey: ['players', groupId],
    queryFn: () => playerApi.list(groupId),
  });

  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  const winnerHint = useMemo(() => {
    if (!player1Id || !player2Id) return null;
    if (score1 === score2) return 'Match nul';
    const winnerId = score1 > score2 ? player1Id : player2Id;
    return players?.find((p) => p.id === winnerId)?.pseudo ?? null;
  }, [player1Id, player2Id, score1, score2, players]);

  const mutation = useMutation({
    mutationFn: () =>
      matchApi.create(groupId, {
        player1Id,
        player2Id,
        team1Name: team1Name.trim(),
        team2Name: team2Name.trim(),
        score1,
        score2,
      }),
    onSuccess: () => {
      toast.success('Match enregistré !');
      queryClient.invalidateQueries({ queryKey: ['dashboard', groupId] });
      queryClient.invalidateQueries({ queryKey: ['matches', groupId] });
      queryClient.invalidateQueries({ queryKey: ['players', groupId] });
      queryClient.invalidateQueries({ queryKey: ['rankings', groupId] });
      navigate(`/g/${groupId}/history`);
    },
    onError: (err) => toast.error(extractError(err)),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!player1Id || !player2Id) return toast.error('Sélectionnez les deux joueurs');
    if (player1Id === player2Id) return toast.error('Sélectionnez deux joueurs différents');
    if (!team1Name.trim() || !team2Name.trim()) return toast.error('Renseignez les deux équipes');
    mutation.mutate();
  };

  const options = players ?? [];

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <PageHeader title="Enregistrer un match" subtitle="Moins de 10 secondes, chrono en main." />

      <form onSubmit={onSubmit} className="card space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Joueur 1 */}
          <div className="space-y-3 rounded-xl border border-surface-700 bg-surface-850/50 p-4">
            <p className="text-xs font-semibold uppercase text-brand-600">Joueur 1</p>
            <select
              value={player1Id}
              onChange={(e) => setPlayer1Id(e.target.value)}
              className="input"
            >
              <option value="">Sélectionner...</option>
              {options.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === player2Id}>
                  {p.pseudo}
                </option>
              ))}
            </select>
            <input
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value)}
              className="input"
              placeholder="Nom de l'équipe (ex: Real Madrid)"
            />
          </div>

          {/* Joueur 2 */}
          <div className="space-y-3 rounded-xl border border-surface-700 bg-surface-850/50 p-4">
            <p className="text-xs font-semibold uppercase text-brand-600">Joueur 2</p>
            <select
              value={player2Id}
              onChange={(e) => setPlayer2Id(e.target.value)}
              className="input"
            >
              <option value="">Sélectionner...</option>
              {options.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === player1Id}>
                  {p.pseudo}
                </option>
              ))}
            </select>
            <input
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value)}
              className="input"
              placeholder="Nom de l'équipe (ex: FC Barcelone)"
            />
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-4 rounded-xl border border-surface-700 bg-surface-850/50 p-5 sm:flex-row sm:justify-center sm:gap-8">
          <ScoreStepper value={score1} onChange={setScore1} />
          <span className="text-2xl font-bold text-slate-400">VS</span>
          <ScoreStepper value={score2} onChange={setScore2} />
        </div>

        {winnerHint && (
          <div
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium',
              winnerHint === 'Match nul'
                ? 'bg-surface-700 text-slate-700'
                : 'bg-brand-500/10 text-brand-700',
            )}
          >
            {winnerHint !== 'Match nul' && <Trophy className="h-4 w-4" />}
            {winnerHint === 'Match nul' ? 'Match nul' : `Vainqueur : ${winnerHint}`}
          </div>
        )}

        <div className="flex items-center gap-3">
          {options.length >= 2 && (
            <button
              type="button"
              onClick={() => {
                setPlayer1Id(player2Id);
                setPlayer2Id(player1Id);
                setTeam1Name(team2Name);
                setTeam2Name(team1Name);
                setScore1(score2);
                setScore2(score1);
              }}
              className="btn-ghost"
            >
              Inverser
            </button>
          )}
          <button type="submit" disabled={mutation.isPending} className="btn-primary ml-auto px-6 py-3">
            {mutation.isPending ? (
              <Spinner className="text-surface-950" />
            ) : (
              <>
                <PlusCircle className="h-4 w-4" /> Valider le match
              </>
            )}
          </button>
        </div>
      </form>

      {options.length < 2 && (
        <p className="mt-4 text-center text-sm text-yellow-400">
          Il faut au moins 2 joueurs acceptés dans le groupe pour enregistrer un match.
        </p>
      )}
    </div>
  );
}
