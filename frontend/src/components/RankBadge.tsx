import { cn } from '../utils/cn.js';

export function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: 'bg-yellow-400/15 text-yellow-300 ring-yellow-400/30',
    2: 'bg-slate-300/15 text-slate-200 ring-slate-300/30',
    3: 'bg-amber-600/15 text-amber-400 ring-amber-600/30',
  };
  return (
    <span
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ring-1',
        styles[rank] ?? 'bg-surface-800 text-slate-400 ring-surface-700',
      )}
    >
      {rank}
    </span>
  );
}
