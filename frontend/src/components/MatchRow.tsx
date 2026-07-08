import { Avatar } from './Avatar.js';
import { relativeTime } from '../utils/format.js';
import { cn } from '../utils/cn.js';
import type { Match } from '../types/index.js';

export function MatchRow({ match }: { match: Match }) {
  const p1Win = match.winner?.id === match.player1.id;
  const p2Win = match.winner?.id === match.player2.id;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-surface-700/60 bg-surface-850/50 p-3 transition-colors hover:border-brand-600/40">
      <div className="flex flex-1 items-center justify-end gap-2 text-right">
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold', p1Win ? 'text-brand-300' : 'text-slate-200')}>
            {match.player1.pseudo}
          </p>
          <p className="truncate text-xs text-slate-500">{match.team1Name}</p>
        </div>
        <Avatar name={match.player1.pseudo} src={match.player1.photoUrl} size="sm" />
      </div>

      <div className="flex flex-col items-center px-1">
        <div className="flex items-center gap-1.5 font-bold tabular-nums">
          <span className={cn('text-lg', p1Win ? 'text-brand-400' : 'text-slate-300')}>
            {match.score1}
          </span>
          <span className="text-slate-600">:</span>
          <span className={cn('text-lg', p2Win ? 'text-brand-400' : 'text-slate-300')}>
            {match.score2}
          </span>
        </div>
        <span className="mt-0.5 whitespace-nowrap text-[10px] text-slate-500">
          {relativeTime(match.playedAt)}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <Avatar name={match.player2.pseudo} src={match.player2.photoUrl} size="sm" />
        <div className="min-w-0">
          <p className={cn('truncate text-sm font-semibold', p2Win ? 'text-brand-300' : 'text-slate-200')}>
            {match.player2.pseudo}
          </p>
          <p className="truncate text-xs text-slate-500">{match.team2Name}</p>
        </div>
      </div>
    </div>
  );
}
