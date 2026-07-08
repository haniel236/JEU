import { Link } from 'react-router-dom';
import {
  Trophy,
  Zap,
  ShieldCheck,
  BarChart3,
  Swords,
  Bell,
  Users,
  ArrowRight,
} from 'lucide-react';

const features = [
  { icon: Zap, title: 'Rapide', desc: 'Enregistrez un match en moins de 10 secondes.' },
  { icon: BarChart3, title: 'Statistiques automatiques', desc: 'Victoires, pourcentages et classements calculés en direct.' },
  { icon: Swords, title: 'Face-à-Face', desc: 'Comparez deux joueurs et réglez les débats.' },
  { icon: Bell, title: 'Temps réel', desc: 'Notifications instantanées à chaque match, sans recharger.' },
  { icon: ShieldCheck, title: 'Sécurisé & privé', desc: 'Chaque groupe possède son espace totalement isolé.' },
  { icon: Users, title: 'Multi-groupes', desc: 'Créez une communauté indépendante pour vos amis.' },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-slate-50">Zéro Mensonge</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost">
            Se connecter
          </Link>
          <Link to="/create-group" className="btn-primary">
            Créer un groupe
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:py-24">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          La référence pour les communautés FC
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-6xl">
          Fini les disputes.
          <br />
          <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
            Place aux statistiques.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Enregistrez vos matchs 1 contre 1, laissez la plateforme calculer automatiquement toutes
          les stats, classements et confrontations directes.
        </p>
        <p className="mt-4 text-xl font-semibold italic text-brand-400">
          « Les statistiques ne mentent jamais. »
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/create-group" className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
            Créer un groupe <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/join-group" className="btn-secondary w-full px-6 py-3 text-base sm:w-auto">
            Rejoindre un groupe
          </Link>
        </div>
      </section>

      {/* Mockup / capture */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="card overflow-hidden p-2 shadow-glow">
          <div className="grid gap-3 rounded-xl bg-surface-950 p-6 sm:grid-cols-3">
            {[
              { label: 'Matchs joués', value: '1 248' },
              { label: 'Joueurs actifs', value: '32' },
              { label: 'Numéro 1', value: 'ElHaniel' },
            ].map((stat) => (
              <div key={stat.label} className="card p-5">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-50">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-50">Tout ce qu'il vous faut</h2>
        <p className="mt-3 text-center text-slate-400">
          Une plateforme complète, rapide et pensée pour les joueurs.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="mb-3 inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-400">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-20">
        <div className="card flex flex-col items-center gap-4 p-10 text-center shadow-glow">
          <h2 className="text-2xl font-bold text-slate-50">Prêt à mettre fin aux débats ?</h2>
          <p className="text-slate-400">Créez votre groupe en quelques secondes.</p>
          <Link to="/create-group" className="btn-primary px-6 py-3 text-base">
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-800 py-6 text-center text-sm text-slate-500">
        © 2026 — Conçu et développé par <span className="text-brand-400">haniel_dev</span>. Tous
        droits réservés.
      </footer>
    </div>
  );
}
