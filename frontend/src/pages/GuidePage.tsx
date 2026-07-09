import { Link } from 'react-router-dom';
import {
  UserPlus,
  LogIn,
  PlusCircle,
  Trophy,
  Swords,
  Bell,
  Smartphone,
  Volume2,
  ArrowRight,
} from 'lucide-react';
import { PublicHeader } from '../components/PublicHeader.js';

const steps = [
  {
    icon: UserPlus,
    title: '1. Créez ou rejoignez un groupe',
    desc: "Créez votre communauté (vous en devenez l'administrateur) ou rejoignez-en une avec un code d'invitation. Chaque groupe est privé et indépendant.",
  },
  {
    icon: LogIn,
    title: '2. Connectez-vous',
    desc: 'Votre compte est protégé (mot de passe chiffré, session sécurisée). Vous retrouvez tous vos groupes après connexion.',
  },
  {
    icon: PlusCircle,
    title: '3. Enregistrez un match',
    desc: 'Choisissez les deux joueurs, les équipes et le score. Le vainqueur et toutes les statistiques sont calculés automatiquement, en moins de 10 secondes.',
  },
  {
    icon: Trophy,
    title: '4. Consultez classements & profils',
    desc: 'Victoires, défaites, nuls, taux de victoire, buts — filtrables par semaine, mois, année ou tout-temps. Chaque joueur a sa fiche détaillée.',
  },
  {
    icon: Swords,
    title: '5. Réglez les débats en Face-à-Face',
    desc: 'Comparez deux joueurs directement : historique complet des confrontations et bilan. « Les statistiques ne mentent jamais. »',
  },
  {
    icon: Bell,
    title: '6. Restez notifié en temps réel',
    desc: 'Nouveau match, demande d\'adhésion, changement de numéro 1… Les notifications arrivent instantanément, avec un son.',
  },
];

const tips = [
  {
    icon: Smartphone,
    title: 'Installer sur Android',
    desc: "Ouvrez le site dans Chrome sur Android, puis touchez « Installer l'application » (ou menu ⋮ → « Ajouter à l'écran d'accueil »). L'app s'ouvre alors en plein écran, comme une vraie application.",
  },
  {
    icon: Bell,
    title: 'Activer les notifications',
    desc: "Après installation, ouvrez vos notifications dans l'app et touchez « Activer les notifications ». Autorisez-les : vous les recevrez même l'application fermée.",
  },
  {
    icon: Volume2,
    title: 'Régler le son',
    desc: "Un bouton haut-parleur permet de couper/activer les sons. Les sons des actions importantes (match enregistré, victoire, notification) sont volontairement bien audibles.",
  },
];

export function GuidePage() {
  return (
    <div className="min-h-screen animate-fade-in">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-700">
          Guide d'utilisation
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Prendre en main « Zéro Mensonge »
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Suivez ces étapes pour enregistrer vos matchs et laisser les statistiques trancher.
        </p>

        <div className="mt-8 space-y-4">
          {steps.map((s) => (
            <div key={s.title} className="card card-hover flex items-start gap-4 p-6">
              <div className="inline-flex shrink-0 rounded-xl bg-brand-500/10 p-3 text-brand-600">
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-2xl font-bold text-slate-900">Application mobile, notifications & son</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {tips.map((t) => (
            <div key={t.title} className="card p-6">
              <div className="mb-3 inline-flex rounded-xl bg-brand-500/10 p-3 text-brand-600">
                <t.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
            </div>
          ))}
        </div>

        <div className="card mt-12 flex flex-col items-center gap-4 p-8 text-center shadow-glow">
          <h2 className="text-xl font-bold text-slate-900">Prêt à commencer ?</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/create-group" className="btn-primary px-6 py-3 text-base">
              Créer un groupe <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/join-group" className="btn-secondary px-6 py-3 text-base">
              Rejoindre un groupe
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
