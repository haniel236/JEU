import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout.js';
import { groupApi } from '../services/endpoints.js';
import { extractError } from '../services/api.js';
import { Spinner } from '../components/Spinner.js';
import type { GroupSummary } from '../types/index.js';

export function JoinGroupPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({ name: '', pseudo: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const lookup = async () => {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const found = await groupApi.lookup(code.trim());
      setGroup(found);
      toast.success(`Groupe trouvé : ${found.name}`);
    } catch (err) {
      setGroup(null);
      toast.error(extractError(err));
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    setLoading(true);
    try {
      await groupApi.join({ code: code.trim(), ...form });
      toast.success('Demande envoyée ! En attente de validation par un administrateur.');
      navigate('/login');
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Rejoindre un groupe"
      subtitle="Entrez le code d'invitation fourni par un membre."
      footer={
        <>
          Retour à l'{' '}
          <Link to="/" className="font-medium text-brand-400 hover:underline">
            accueil
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Code du groupe</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input"
              placeholder="DEMO-2026"
            />
            <button onClick={lookup} disabled={checking} className="btn-secondary shrink-0">
              {checking ? <Spinner /> : <Search className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {group && (
          <form onSubmit={onSubmit} className="animate-fade-in space-y-4 border-t border-surface-700 pt-4">
            <div className="rounded-xl bg-brand-500/10 px-4 py-2.5 text-sm text-brand-300">
              Vous rejoignez : <span className="font-semibold">{group.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Nom</label>
                <input required value={form.name} onChange={update('name')} className="input" />
              </div>
              <div>
                <label className="label">Pseudo</label>
                <input required value={form.pseudo} onChange={update('pseudo')} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Adresse e-mail</label>
              <input type="email" required value={form.email} onChange={update('email')} className="input" autoComplete="email" />
            </div>
            <div>
              <label className="label">Mot de passe</label>
              <input type="password" required minLength={6} value={form.password} onChange={update('password')} className="input" autoComplete="new-password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Spinner className="text-surface-950" /> : 'Envoyer la demande'}
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
