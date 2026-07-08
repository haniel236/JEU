import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-surface-700 py-14 text-center">
      <div className="rounded-2xl bg-surface-800 p-4 text-slate-500">
        <Icon className="h-7 w-7" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
