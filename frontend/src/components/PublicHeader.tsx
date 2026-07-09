import { Link, NavLink } from 'react-router-dom';
import { BookOpen, Info, Trophy } from 'lucide-react';
import { SoundToggle } from './SoundToggle.js';
import { InstallButton } from './InstallButton.js';
import { cn } from '../utils/cn.js';

const links = [
  { to: '/guide', label: 'Guide', icon: BookOpen },
  { to: '/about', label: 'À propos', icon: Info },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-surface-700/70 bg-surface-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">Zéro Mensonge</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/10 text-brand-700'
                    : 'text-slate-600 hover:bg-surface-800 hover:text-slate-900',
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <SoundToggle />
          <InstallButton className="!hidden md:!inline-flex" />
          <Link to="/login" className="btn-ghost">
            Se connecter
          </Link>
          <Link to="/create-group" className="btn-primary">
            Créer un groupe
          </Link>
        </div>
      </div>

      {/* Navigation mobile : Guide / À propos toujours visibles dès la première page. */}
      <nav className="flex items-center gap-2 border-t border-surface-700/70 px-5 py-2 sm:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                isActive ? 'bg-brand-500/10 text-brand-700' : 'text-slate-600 hover:bg-surface-800',
              )
            }
          >
            <l.icon className="h-4 w-4" />
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
