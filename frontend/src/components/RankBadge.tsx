import { cn } from '../utils/cn.js';

export function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: 'bg-yellow-400/20 text-yellow-600 ring-yellow-400/40',
    2: 'bg-slate-400/15 text-slate-600 ring-slate-400/40',
    3: 'bg-amber-500/15 text-amber-700 ring-amber-500/40',
  };
  return (
    <span
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ring-1',
        styles[rank] ?? 'bg-surface-800 text-slate-600 ring-surface-700',
      )}
    >
      {rank}
    </span>
  );
}
