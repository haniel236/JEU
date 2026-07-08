import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '../layouts/AuthLayout.js';
import { useAuth } from '../context/AuthContext.js';
import { authApi } from '../services/endpoints.js';
import { extractError } from '../services/api.js';
import { Spinner } from '../components/Spinner.js';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      const me = await authApi.me();
      const accepted = me.memberships?.filter((m) => m.status === 'ACCEPTED') ?? [];
      toast.success('Connexion réussie');
      if (accepted.length === 1) {
        navigate(`/g/${accepted[0].group.id}`);
      } else {
        navigate('/select-group');
      }
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Se connecter"
      subtitle="Ravi de vous revoir sur la plateforme."
      footer={
        <>
          Pas encore de groupe ?{' '}
          <Link to="/create-group" className="font-medium text-brand-400 hover:underline">
            Créer un groupe
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Adresse e-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="vous@exemple.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <Spinner className="text-surface-950" /> : 'Se connecter'}
        </button>
      </form>
    </AuthLayout>
  );
}
