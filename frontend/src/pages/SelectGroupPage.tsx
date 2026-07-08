import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Trophy, Plus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from '../components/Avatar.js';
import { PageLoader } from '../components/Spinner.js';

export function SelectGroupPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const accepted = user.memberships?.filter((m) => m.status === 'ACCEPTED') ?? [];
  const pending = user.memberships?.filter((m) => m.status === 'PENDING') ?? [];

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center p-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Mes groupes</p>
            <p className="text-xs text-slate-500">{user.name}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="btn-ghost text-sm text-red-400"
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>

      <div className="space-y-3">
        {accepted.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate(`/g/${m.group.id}`)}
            className="card card-hover flex w-full items-center gap-4 p-4 text-left"
          >
            <Avatar name={m.group.name} src={m.group.logoUrl} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{m.group.name}</p>
              <p className="text-sm text-slate-500">
                {m.role === 'ADMIN' ? 'Administrateur' : 'Joueur'} · @{m.pseudo}
              </p>
            </div>
            <LogIn className="h-5 w-5 text-brand-600" />
          </button>
        ))}

        {pending.map((m) => (
          <div key={m.id} className="card flex items-center gap-4 p-4 opacity-70">
            <Avatar name={m.group.name} src={m.group.logoUrl} size="lg" />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{m.group.name}</p>
              <p className="text-sm text-yellow-400">Demande en attente de validation</p>
            </div>
          </div>
        ))}

        {accepted.length === 0 && pending.length === 0 && (
          <div className="card p-6 text-center text-slate-600">
            Vous n'appartenez à aucun groupe pour le moment.
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link to="/create-group" className="btn-secondary py-3">
          <Plus className="h-4 w-4" /> Créer un groupe
        </Link>
        <Link to="/join-group" className="btn-secondary py-3">
          <LogIn className="h-4 w-4" /> Rejoindre
        </Link>
      </div>
    </div>
  );
}
