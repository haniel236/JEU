import { Link } from 'react-router-dom';
import { Target, ShieldCheck, Zap, Code2, Heart, ArrowRight } from 'lucide-react';
import { PublicHeader } from '../components/PublicHeader.js';

const values = [
  {
    icon: Target,
    title: 'Notre mission',
    desc: "Mettre fin aux disputes entre joueurs de FC. Les chiffres sont enregistrés, calculés et partagés : plus de « je t'ai battu la dernière fois » invérifiable.",
  },
  {
    icon: ShieldCheck,
    title: 'Privé & sécurisé',
    desc: 'Chaque groupe possède son espace totalement isolé. Comptes protégés, mots de passe chiffrés et validation des adhésions par l\'administrateur.',
  },
  {
    icon: Zap,
    title: 'Rapide & en temps réel',
    desc: 'Enregistrement en quelques secondes, statistiques instantanées et notifications en direct — sur ordinateur comme sur mobile.',
  },
  {
    icon: Code2,
    title: 'Une vraie application web',
    desc: 'Construite avec React, une API Node.js/Express et une base PostgreSQL. Installable sur Android (PWA) avec notifications push et sons.',
  },
];

export function AboutPage() {
  return (
    <div className="min-h-screen animate-fade-in">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-700">
          À propos
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Zéro Mensonge dans le Jeu
        </h1>
        <p className="mt-4 text-xl font-semibold italic text-brand-600">
          « Les statistiques ne mentent jamais. »
        </p>
        <p className="mt-3 max-w-2xl text-slate-600">
          Une plateforme pensée pour les communautés de joueurs de football virtuel (FC) qui veulent
          garder une trace fiable de leurs matchs 1 contre 1 : statistiques, classements et
          confrontations directes, calculés automatiquement.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="card card-hover flex items-start gap-4 p-6">
              <div className="inline-flex shrink-0 rounded-xl bg-brand-500/10 p-3 text-brand-600">
                <v.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{v.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-10 flex items-center gap-3 p-6">
          <Heart className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-slate-600">
            Conçu et développé par <span className="font-semibold text-brand-600">haniel_dev</span>.
            Merci de faire partie de l'aventure.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link to="/guide" className="btn-secondary px-6 py-3 text-base">
            Lire le guide
          </Link>
          <Link to="/create-group" className="btn-primary px-6 py-3 text-base">
            Créer un groupe <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
