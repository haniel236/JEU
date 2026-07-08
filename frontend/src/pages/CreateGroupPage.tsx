import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from '../layouts/AuthLayout.js';
import { useAuth } from '../context/AuthContext.js';
import { groupApi } from '../services/endpoints.js';
import { extractError } from '../services/api.js';
import { Spinner } from '../components/Spinner.js';

export function CreateGroupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    groupName: '',
    adminName: '',
    adminPseudo: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const group = await groupApi.create({
        groupName: form.groupName,
        adminName: form.adminName,
        adminPseudo: form.adminPseudo || undefined,
        email: form.email,
        password: form.password,
      });
      await login(form.email, form.password);
      toast.success(`Groupe « ${group.name} » créé !`);
      navigate(`/g/${group.id}`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Créer un groupe"
      subtitle="Devenez administrateur de votre communauté FC."
      footer={
        <>
          Déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-brand-400 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Nom du groupe</label>
          <input required value={form.groupName} onChange={update('groupName')} className="input" placeholder="Les Légendes FC" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Votre nom</label>
            <input required value={form.adminName} onChange={update('adminName')} className="input" placeholder="Haniel" />
          </div>
          <div>
            <label className="label">Pseudo</label>
            <input value={form.adminPseudo} onChange={update('adminPseudo')} className="input" placeholder="ElHaniel" />
          </div>
        </div>
        <div>
          <label className="label">Adresse e-mail</label>
          <input type="email" required value={form.email} onChange={update('email')} className="input" placeholder="vous@exemple.com" autoComplete="email" />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input type="password" required minLength={6} value={form.password} onChange={update('password')} className="input" placeholder="6 caractères minimum" autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <Spinner className="text-surface-950" /> : 'Créer le groupe'}
        </button>
      </form>
    </AuthLayout>
  );
}
