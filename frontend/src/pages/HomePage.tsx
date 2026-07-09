import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  BarChart3,
  Swords,
  Bell,
  Users,
  ArrowRight,
  BookOpen,
  Info,
  Smartphone,
} from 'lucide-react';
import { PublicHeader } from '../components/PublicHeader.js';
import { InstallButton } from '../components/InstallButton.js';

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
    <div className="min-h-screen animate-fade-in">
      <PublicHeader />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 py-16 text-center sm:py-24">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-700">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
          La référence pour les communautés FC
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Fini les disputes.
          <br />
          <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
            Place aux statistiques.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Enregistrez vos matchs 1 contre 1, laissez la plateforme calculer automatiquement toutes
          les stats, classements et confrontations directes.
        </p>
        <p className="mt-4 text-xl font-semibold italic text-brand-600">
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

      {/* Accès rapides : Guide & À propos, mis en avant dès la première page */}
      <section className="mx-auto max-w-5xl px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/guide" className="card card-hover flex items-start gap-4 p-6">
            <div className="inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="flex items-center gap-1 text-lg font-semibold text-slate-900">
                Guide d'utilisation <ArrowRight className="h-4 w-4 text-brand-600" />
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Créez un groupe, enregistrez vos matchs et suivez les classements — pas à pas.
              </p>
            </div>
          </Link>
          <Link to="/about" className="card card-hover flex items-start gap-4 p-6">
            <div className="inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-600">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <h3 className="flex items-center gap-1 text-lg font-semibold text-slate-900">
                À propos <ArrowRight className="h-4 w-4 text-brand-600" />
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Notre mission, le concept « Zéro Mensonge » et comment l'app est construite.
              </p>
            </div>
          </Link>
        </div>

        {/* Installation Android / PWA */}
        <div className="card mt-4 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-600">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Installez l'application</h3>
              <p className="mt-1 text-sm text-slate-600">
                Ajoutez « Zéro Mensonge » à votre écran d'accueil Android et recevez les
                notifications.
              </p>
            </div>
          </div>
          <InstallButton className="w-full px-6 py-3 text-base sm:w-auto" />
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
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900">Tout ce qu'il vous faut</h2>
        <p className="mt-3 text-center text-slate-600">
          Une plateforme complète, rapide et pensée pour les joueurs.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="mb-3 inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-600">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 pb-20">
        <div className="card flex flex-col items-center gap-4 p-10 text-center shadow-glow">
          <h2 className="text-2xl font-bold text-slate-900">Prêt à mettre fin aux débats ?</h2>
          <p className="text-slate-600">Créez votre groupe en quelques secondes.</p>
          <Link to="/create-group" className="btn-primary px-6 py-3 text-base">
            Commencer gratuitement <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-800 py-6 text-center text-sm text-slate-500">
        <div className="mb-3 flex items-center justify-center gap-4">
          <Link to="/guide" className="hover:text-brand-600">
            Guide d'utilisation
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/about" className="hover:text-brand-600">
            À propos
          </Link>
        </div>
        © 2026 — Conçu et développé par <span className="text-brand-600">haniel_dev</span>. Tous
        droits réservés.
      </footer>
    </div>
  );
}
