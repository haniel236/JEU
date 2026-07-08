import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-50">Zéro Mensonge</p>
            <p className="text-xs text-brand-400">Les statistiques ne mentent jamais.</p>
          </div>
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-bold text-slate-50">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-4 text-center text-sm text-slate-400">{footer}</div>}
      </div>
    </div>
  );
}
