# Zéro Mensonge dans le Jeu

> **"Les statistiques ne mentent jamais."**

Plateforme web multi-groupes permettant à des communautés de joueurs de football
virtuel (FC) d'enregistrer leurs matchs 1 contre 1 et de calculer automatiquement
toutes les statistiques, classements et confrontations directes.

## Architecture

Monorepo composé de deux applications :

- **`backend/`** — API REST + temps réel
  - Node.js, Express.js, TypeScript
  - PostgreSQL via Prisma ORM
  - Authentification JWT + Refresh Token (bcrypt)
  - Notifications temps réel avec Socket.IO
  - Sécurité : helmet, rate-limiting, validation Zod, journalisation (AuditLog)
- **`frontend/`** — Interface utilisateur
  - React, TypeScript, Vite
  - Tailwind CSS (thème sombre, couleur principale verte)
  - React Router, React Query (TanStack Query)
  - Client Socket.IO pour les notifications en direct

## Démarrage rapide

### Prérequis

- Node.js 20+
- PostgreSQL 14+ (ou Docker)

### 1. Base de données

```bash
docker run --name zmj-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=zmj -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env      # ajuster DATABASE_URL et les secrets si besoin
npm install
npm run prisma:generate
npm run prisma:migrate     # crée les tables
npm run dev                # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

## Scripts utiles

### Backend

| Script | Description |
| --- | --- |
| `npm run dev` | Serveur de développement (tsx watch) |
| `npm run build` | Compilation TypeScript |
| `npm run start` | Démarre le serveur compilé |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification de types |
| `npm run prisma:migrate` | Applique les migrations |
| `npm run prisma:studio` | Interface Prisma Studio |
| `npm run seed` | Données de démonstration |

### Frontend

| Script | Description |
| --- | --- |
| `npm run dev` | Serveur Vite |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualisation du build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification de types |

## Déploiement

- **Frontend** : Vercel
- **Backend** : Railway ou Render
- **Base de données** : Supabase PostgreSQL ou Neon PostgreSQL

---

© 2026 — Conçu et développé par **haniel_dev**. Tous droits réservés.
