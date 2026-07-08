import type { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn.js';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, className }: StatCardProps) {
  return (
    <div className={cn('card card-hover animate-fade-in p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-50">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-xl bg-brand-500/10 p-2.5 text-brand-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
