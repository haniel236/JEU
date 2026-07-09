---
name: deploy-config
description: Canonical GitHub + Render deployment configuration for this project (Zéro Mensonge dans le Jeu). ALWAYS read this before any deployment, environment-variable, or "why isn't my change live?" task. It fixes which GitHub repo and which Render services are the source of truth, regardless of which GitHub/Render account is currently connected.
---

# Deployment configuration (source of truth)

Any deployment for this project goes to **one** GitHub repo and **one** Render account.
Do not deploy anywhere else, even if a different account happens to be connected.

## GitHub

- Repo: `haniel236/JEU` — https://github.com/haniel236/JEU
- **Deploy branch: `main`.** Render deploys `main` and only `main`.
- IMPORTANT: the GitHub *default* branch may be something else (e.g. `devin/...-zmj-platform`). That default branch is NOT deployed. Merging into the default branch does nothing on Render. Always merge into `main` to ship.
- Workflow: create a feature branch → PR into `main` → merge. The merge into `main` auto-triggers Render (autoDeploy = on commit) for both services.

## Render

Team/owner: `tea-d97f3o8k1i2s73e03am0` (account email: hanijea25@gmail.com).

| Service | Type | Render ID | Branch | URL | rootDir |
|---|---|---|---|---|---|
| `zmj-backend` | web (node) | `srv-d97f57naqgkc73edbhug` | main | https://zmj-backend.onrender.com | `backend` |
| `zmj-frontend` | static | `srv-d97f5b3eo5us739qlkkg` | main | https://zmj-frontend.onrender.com | `frontend` |

- Backend build: `npm install --include=dev && npm run prisma:generate && npm run build && npm run prisma:deploy` — so **Prisma migrations are applied automatically at build** (`prisma:deploy`). No manual migration step needed on deploy.
- Backend start: `npm run start`. Health check: `GET /api/health`.
- Frontend build: `npm install && npm run build`, publish `dist`, SPA rewrite `/* -> /index.html`.

## Required environment variables (Render)

Set these in the Render dashboard / API, never commit them.

Backend (`zmj-backend`):
- `DATABASE_URL` — Supabase Session pooler connection string.
- `CLIENT_URL` — frontend public URL (CORS/cookies), e.g. `https://zmj-frontend.onrender.com`.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (generated), `JWT_ACCESS_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d`.
- Web Push (VAPID): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (e.g. `mailto:hanijea25@gmail.com`). Generate with `npm run generate:vapid` in `backend`. Without these the app still runs; push is simply unavailable (graceful degradation). The frontend fetches the public key from `GET /api/push/public-key`, so the frontend needs no VAPID var.

Frontend (`zmj-frontend`):
- `VITE_API_URL` — backend public URL, e.g. `https://zmj-backend.onrender.com`.

## Secrets — provided per session, never stored here

This file contains NO tokens or keys. Each session, ask the user for:
- A GitHub token (push / PR / merge).
- A Render API key (`rnd_...`). Create at https://dashboard.render.com/u/settings#api-keys. It grants broad account access — treat as temporary and remind the user to revoke it after.

## How to operate Render from the terminal (REST API)

Auth header: `Authorization: Bearer $RENDER_API_KEY`. Base: `https://api.render.com/v1`.

- List services: `GET /services?limit=50`
- Upsert one env var (does NOT wipe others): `PUT /services/{serviceId}/env-vars/{KEY}` with body `{"value":"..."}`
- Trigger a deploy: `POST /services/{serviceId}/deploys` with body `{}`
- Poll a deploy: `GET /services/{serviceId}/deploys/{deployId}` — wait for `status == "live"`.

Note: setting env vars does not always auto-deploy — trigger a deploy explicitly afterwards so the new values take effect.

## Verify a deploy is healthy

- `GET https://zmj-backend.onrender.com/api/health` → `{"status":"ok"}`
- `GET https://zmj-backend.onrender.com/api/push/public-key` → returns the VAPID public key when push is configured.
- `GET https://zmj-frontend.onrender.com/manifest.webmanifest`, `/sw.js`, `/push-sw.js` → 200 (PWA installable).
