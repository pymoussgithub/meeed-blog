# MEEED Magazine

Site magazine / blog de l'association **MEEED** (*Maraichage Efficient en Eau et en Energie Décarbonée*).

Stack : **Next.js 15** · **TypeScript** · **Tailwind CSS 4** · **PostgreSQL** · **Prisma** · **Cloudinary** · déploiement **Heroku**.

## Prérequis

- **Node.js** 20+ (testé avec 22.x)
- **npm** 10+
- **PostgreSQL** 15+ (local ou Docker) — Phase 2
- Compte **Cloudinary** — Phase 3
- App **Heroku** — Phase 8

## Installation locale

```bash
# 1. Cloner le dépôt et entrer dans le dossier
cd MEEED

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env
# Sous Windows PowerShell :
# Copy-Item .env.example .env

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migrations Prisma (dev) |
| `npm run db:migrate:deploy` | Migrations Prisma (production) |
| `npm run db:seed` | Peupler la base (admin + catégories) |

## Structure du projet

```
docs/           → Spécifications (functional_spec, architecture, roadmap)
public/         → Assets statiques (logo, favicon, OG)
src/app/        → Routes Next.js (App Router)
src/components/ → Composants React
src/lib/        → Utilitaires et services
src/actions/    → Server Actions (phases ultérieures)
src/types/      → Types TypeScript
```

## Variables d'environnement

Voir [`.env.example`](.env.example). Les variables deviennent nécessaires phase par phase :

| Phase | Variables |
|-------|-----------|
| 2 | `DATABASE_URL` |
| 3 | `CLOUDINARY_*` |
| 4 | `NEXTAUTH_URL`, `NEXTAUTH_SECRET` |
| Forum (FB-16) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` |

## Forum

Le module Forum (`/forum`) permet aux contributeurs et administrateurs connectés de créer des sujets et des réponses. Les anonymes consultent uniquement.

- Rubriques : `/forum/r/{slug}`
- Sujet : `/forum/s/{slug}`
- Recherche full-text : `/forum/recherche?q=`
- Admin : `/admin/forum` (modération) et `/admin/forum/rubriques`
- Notifications e-mail aux participants lors d'une nouvelle réponse (SMTP optionnel — la publication reste OK si SMTP est absent ou en erreur)

## Documentation

- [Spécifications fonctionnelles](docs/functional_spec.md)
- [Architecture technique](docs/architecture.md)
- [Roadmap de développement](docs/roadmap.md)
- [Opérations — backup, DNS, tests](docs/operations.md)

## Assets graphiques

Le logo SVG dans `public/logo-meeed.svg` est un placeholder. Remplacez-le par le logo officiel :

```text
https://meeed.fr/data/files/meeedlogoimage.png  →  public/logo-meeed.png
```

Puis mettez à jour `Header.tsx` et `Footer.tsx` pour pointer vers `/logo-meeed.png`.

## Déploiement Heroku

Voir aussi `docs/architecture.md` §8.

### Prérequis

- Compte [Heroku](https://heroku.com) et [CLI Heroku](https://devcenter.heroku.com/articles/heroku-cli)
- Dépôt GitHub connecté au projet
- Compte Cloudinary configuré

### 1. Créer l'application

```bash
# Depuis la racine du projet
heroku login
heroku create meeed-magazine   # ou via le dashboard + app.json

# Addon PostgreSQL
heroku addons:create heroku-postgresql:essential-0
```

Ou déploiement en un clic si le repo est lié à `app.json` sur le dashboard Heroku.

### 2. Variables d'environnement

```bash
heroku config:set NEXTAUTH_URL=https://meeed-magazine.herokuapp.com
heroku config:set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
heroku config:set CLOUDINARY_CLOUD_NAME=xxx
heroku config:set CLOUDINARY_API_KEY=xxx
heroku config:set CLOUDINARY_API_SECRET=xxx
```

`DATABASE_URL` est injectée automatiquement par Heroku Postgres.

Après bascule DNS, mettre à jour : `heroku config:set NEXTAUTH_URL=https://meeed.fr`

### 3. Déployer

```bash
git push heroku main
# ou activer les déploiements automatiques depuis GitHub (branche main)
```

Le `Procfile` exécute automatiquement `prisma migrate deploy` en phase **release** avant chaque déploiement.

### 4. Seed initial (une seule fois)

```bash
heroku run npm run db:seed
```

Compte admin par défaut : `admin@meeed.fr` / `Meeed2026!` — **à changer immédiatement en production**.

### 5. Vérifications

```bash
heroku logs --tail
heroku open
curl https://votre-app.herokuapp.com/api/health
```

Réponse attendue : `{"status":"ok","checks":{"database":"ok","cloudinary":"ok"}}`

### 6. Domaine personnalisé

```bash
heroku domains:add meeed.fr
heroku domains:add www.meeed.fr
```

Configurer les enregistrements DNS chez le registrar (CNAME vers `*.herokudns.com`), puis mettre à jour `NEXTAUTH_URL`.

### 7. Health check Heroku (optionnel)

Dans le dashboard Heroku → Settings → Health check : chemin `/api/health`.

## Licence

Projet privé — Association MEEED.
