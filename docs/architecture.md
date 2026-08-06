# Architecture technique — MEEED Magazine

> **Version** : 1.0 — Document de cadrage (Étape 0)  
> **Stack retenue** : Next.js 15 (App Router) + TypeScript + Tailwind CSS + PostgreSQL + Prisma + Cloudinary

---

## 1. Choix de la stack

### 1.1 Décision : Next.js (App Router)

| Critère | Next.js | Alternative (Express + React SPA) |
|---------|---------|-----------------------------------|
| SEO / SSR | Natif (RSC, SSR, SSG) | Nécessite configuration supplémentaire |
| Open Graph / WhatsApp | `generateMetadata()` par route | Plus complexe |
| Performance mobile | Excellent (optimisation images, fonts) | Dépend de l'implémentation |
| Déploiement Heroku | Supporté (build standalone) | Supporté |
| Courbe d'apprentissage Cursor | Excellente | Bonne |

**Verdict** : Next.js App Router est le choix optimal pour ce projet, principalement pour le SEO, le partage social et la productivité de développement.

### 1.2 Stack complète

| Couche | Technologie | Version cible | Rôle |
|--------|-------------|---------------|------|
| Framework | Next.js (App Router) | 15.x | SSR, routing, API routes |
| Langage | TypeScript | 5.x | Typage strict |
| Styles | Tailwind CSS | 4.x | Utility-first, design tokens MEEED |
| ORM | Prisma | 6.x | Modèle de données, migrations |
| Base de données | PostgreSQL | 15+ | Stockage relationnel |
| Auth | NextAuth.js (Auth.js) | 5.x | Sessions, credentials provider |
| Médias | Cloudinary | SDK Node 2.x | Images + PDF |
| Éditeur | TipTap | 2.x | WYSIWYG côté admin |
| Validation | Zod | 3.x | Schémas API et formulaires |
| Sanitization | isomorphic-dompurify | — | Nettoyage HTML éditeur |
| Slug | slugify | — | Génération URLs |
| Tests | Vitest + Playwright | — | Unitaires + E2E (phase ultérieure) |

---

## 2. Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Navigateur)                      │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐ │
│  │   Front-office      │    │   Back-office (/admin)          │ │
│  │   Magazine public   │    │   Dashboard + Éditeur TipTap    │ │
│  └──────────┬──────────┘    └──────────────┬──────────────────┘ │
└─────────────┼──────────────────────────────┼────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS 15 (Heroku Dyno)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ App Router   │  │ API Routes   │  │ Server Actions       │  │
│  │ (RSC + SSR)  │  │ /api/*       │  │ (mutations admin)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │               │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐ │
│  │                    Services Layer                            │ │
│  │  article.service │ upload.service │ auth.service            │ │
│  └──────┬─────────────────┬──────────────────────┬────────────┘ │
└─────────┼─────────────────┼──────────────────────┼────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
   ┌─────────────┐   ┌─────────────┐        ┌─────────────┐
   │ PostgreSQL  │   │ Cloudinary  │        │ NextAuth    │
   │  (Heroku    │   │  (images +  │        │  Sessions   │
   │   Postgres) │   │   PDF raw)  │        │  (DB store) │
   └─────────────┘   └─────────────┘        └─────────────┘
```

### 2.1 Patterns architecturaux

| Pattern | Application |
|---------|-------------|
| **Server Components** | Pages publiques (liste articles, article, catégories) — rendu serveur pour SEO |
| **Client Components** | Éditeur admin, upload drag & drop, boutons de partage |
| **Server Actions** | CRUD articles, upload métadonnées, gestion catégories |
| **API Routes** | Upload signé Cloudinary, webhooks (futur), health check |
| **Repository pattern** | Services Prisma encapsulés dans `src/lib/services/` |

---

## 3. Structure des dossiers

```
MEEED/
├── docs/                          # Documentation projet
│   ├── functional_spec.md
│   ├── architecture.md
│   └── roadmap.md
├── prisma/
│   ├── schema.prisma              # Modèle de données
│   ├── seed.ts                    # Données initiales (admin, catégories)
│   └── migrations/                # Migrations Prisma
├── public/
│   ├── favicon.ico
│   ├── logo-meeed.png             # Logo local (fallback)
│   └── og-default.jpg             # Image OG par défaut
├── src/
│   ├── app/
│   │   ├── (public)/              # Groupe routes front-office
│   │   │   ├── layout.tsx         # Layout magazine (header, footer)
│   │   │   ├── page.tsx           # Accueil magazine
│   │   │   ├── a/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Page article
│   │   │   ├── c/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Page catégorie
│   │   │   ├── documents/
│   │   │   │   └── page.tsx
│   │   │   ├── a-propos/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── domaines/
│   │   │   │   └── page.tsx
│   │   │   └── recherche/
│   │   │       └── page.tsx
│   │   ├── admin/                 # Back-office
│   │   │   ├── layout.tsx         # Layout admin (sidebar, auth guard)
│   │   │   ├── page.tsx           # Dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx       # Liste articles
│   │   │   │   ├── nouveau/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # Édition
│   │   │   ├── documents/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   └── utilisateurs/
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── upload/
│   │   │   │   ├── image/
│   │   │   │   │   └── route.ts   # Signature upload image
│   │   │   │   └── document/
│   │   │   │       └── route.ts   # Signature upload PDF
│   │   │   └── health/
│   │   │       └── route.ts       # Health check Heroku
│   │   ├── sitemap.ts             # Sitemap dynamique
│   │   ├── robots.ts              # robots.txt
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Tailwind + tokens MEEED
│   ├── components/
│   │   ├── ui/                    # Composants atomiques (Button, Input, Badge...)
│   │   ├── layout/                # Header, Footer, AdminSidebar
│   │   ├── article/               # ArticleCard, ArticleHero, ShareBar
│   │   ├── document/              # DocumentList, DocumentCard
│   │   └── admin/                 # ArticleForm, TipTapEditor, FileUpload
│   ├── lib/
│   │   ├── prisma.ts              # Client Prisma singleton
│   │   ├── cloudinary.ts          # Config + helpers Cloudinary
│   │   ├── auth.ts                # Config NextAuth
│   │   ├── utils.ts               # Helpers (cn, formatDate, slugify)
│   │   ├── validations/           # Schémas Zod
│   │   │   ├── article.ts
│   │   │   ├── category.ts
│   │   │   └── document.ts
│   │   └── services/              # Logique métier
│   │       ├── article.service.ts
│   │       ├── category.service.ts
│   │       ├── document.service.ts
│   │       └── upload.service.ts
│   ├── actions/                   # Server Actions
│   │   ├── article.actions.ts
│   │   ├── category.actions.ts
│   │   └── document.actions.ts
│   └── types/                     # Types TypeScript partagés
│       └── index.ts
├── .env.example                   # Template variables d'environnement
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Procfile                       # Commande de démarrage Heroku
├── app.json                       # Config Heroku (optionnel)
└── README.md
```

---

## 4. Configuration Cloudinary

### 4.1 Rôle

Cloudinary est le **seul stockage externe** pour :
- Images de couverture d'articles
- Images inline dans le contenu éditeur
- Documents PDF téléchargeables

La base PostgreSQL stocke uniquement les **métadonnées** (URLs, public IDs, tailles).

### 4.2 Structure des dossiers Cloudinary

```
meeed/
├── articles/
│   ├── covers/          # Images de couverture
│   │   └── {articleId}/
│   └── inline/          # Images dans le contenu
│       └── {articleId}/
├── documents/           # PDF (resource_type: raw)
│   └── {documentId}/
└── og/                  # Transformations OG générées
    └── {articleId}/
```

### 4.3 Configuration SDK (`src/lib/cloudinary.ts`)

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
```

### 4.4 Upload images (couverture et inline)

**Méthode** : Upload signé côté serveur (plus sécurisé que unsigned pour un back-office)

```typescript
// Signature générée par /api/upload/image
const signature = cloudinary.utils.api_sign_request(
  {
    timestamp,
    folder: `meeed/articles/covers/${articleId}`,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
  process.env.CLOUDINARY_API_SECRET!
);
```

**Transformations automatiques** :
| Usage | Transformation Cloudinary |
|-------|--------------------------|
| Couverture liste (carte) | `c_fill,w_400,h_225,q_auto,f_auto` |
| Couverture article (hero) | `c_fill,w_1200,h_675,q_auto,f_auto` |
| Open Graph | `c_fill,w_1200,h_630,q_auto,f_jpg` |
| Thumbnail | `c_fill,w_150,h_150,q_auto,f_auto` |

**Helper URL** :

```typescript
export function getCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop ?? 'fill',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  });
}

export function getOgImageUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { width: 1200, height: 630, crop: 'fill', quality: 'auto', fetch_format: 'jpg' },
    ],
  });
}
```

### 4.5 Upload documents PDF

```typescript
// Upload via API route /api/upload/document
const result = await cloudinary.uploader.upload(filePath, {
  resource_type: 'raw',          // Obligatoire pour PDF
  folder: `meeed/documents/${documentId}`,
  public_id: slugifiedFileName,
  type: 'upload',
  access_mode: 'public',
});
// result.secure_url → URL de téléchargement
```

**Limites** :
- Taille max : 25 Mo par PDF
- Types MIME acceptés : `application/pdf` uniquement en V1
- Validation côté serveur avant upload

### 4.6 Composant upload admin

Le composant `FileUpload` côté admin :
1. Sélectionne le fichier (drag & drop)
2. Appelle `/api/upload/image` ou `/api/upload/document` pour obtenir la signature
3. Upload direct vers Cloudinary
4. Retourne `publicId` + `secureUrl` au formulaire
5. Le Server Action enregistre les métadonnées en base

### 4.7 Variables Cloudinary

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud |
| `CLOUDINARY_API_KEY` | Clé API |
| `CLOUDINARY_API_SECRET` | Secret API (jamais exposé côté client) |

---

## 5. Configuration base de données (PostgreSQL + Prisma)

### 5.1 Connexion

```env
DATABASE_URL="postgresql://user:password@host:5432/meeed?schema=public"
```

Sur Heroku, `DATABASE_URL` est injectée automatiquement par l'addon Heroku Postgres.

### 5.2 Schéma Prisma (aperçu)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  CONTRIBUTEUR
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  role         UserRole  @default(CONTRIBUTEUR)
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  articles     Article[]
  documents    Document[]
}

model Article {
  id                   String           @id @default(cuid())
  title                String
  slug                 String           @unique
  excerpt              String
  content              String           @db.Text
  coverImageUrl        String?
  coverImagePublicId   String?
  status               ArticleStatus    @default(DRAFT)
  publishedAt          DateTime?
  authorId             String
  author               User             @relation(fields: [authorId], references: [id])
  categories           ArticleCategory[]
  documents            Document[]
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  @@index([status, publishedAt])
  @@index([authorId])
}

model Category {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  description String?
  color       String?           @default("#4ecdc4")
  sortOrder   Int               @default(0)
  articles    ArticleCategory[]
  createdAt   DateTime          @default(now())
}

model ArticleCategory {
  articleId  String
  categoryId String
  article    Article  @relation(fields: [articleId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([articleId, categoryId])
}

model Document {
  id                 String   @id @default(cuid())
  title              String
  description        String?
  fileUrl            String
  fileName           String
  fileSize           Int
  mimeType           String   @default("application/pdf")
  cloudinaryPublicId String
  isPublic           Boolean  @default(true)
  articleId          String?
  article            Article? @relation(fields: [articleId], references: [id], onDelete: SetNull)
  uploadedById       String
  uploadedBy         User     @relation(fields: [uploadedById], references: [id])
  createdAt          DateTime @default(now())

  @@index([articleId])
  @@index([isPublic])
}
```

### 5.3 Migrations

```bash
# Développement
npx prisma migrate dev --name init

# Production (Heroku release phase)
npx prisma migrate deploy
```

---

## 6. Authentification (NextAuth.js v5)

### 6.1 Stratégie

- **Provider** : Credentials (email + password)
- **Session** : JWT ou Database (recommandé : Database pour invalidation)
- **Adapter** : `@auth/prisma-adapter`

### 6.2 Protection des routes admin

```typescript
// src/middleware.ts
export const config = {
  matcher: ['/admin/:path*'],
};

// Redirige vers /admin/login si non authentifié
// Vérifie le rôle pour /admin/utilisateurs et /admin/categories
```

### 6.3 Variables auth

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | URL complète du site (`https://meeed.fr`) |
| `NEXTAUTH_SECRET` | Secret de chiffrement session (32+ caractères aléatoires) |

---

## 7. SEO et métadonnées (Next.js Metadata API)

### 7.1 Page article

```typescript
// src/app/(public)/a/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  const ogImage = article.coverImagePublicId
    ? getOgImageUrl(article.coverImagePublicId)
    : '/og-default.jpg';

  return {
    title: `${article.title} — MEEED`,
    description: article.excerpt,
    openGraph: {
      type: 'article',
      url: `https://meeed.fr/a/${article.slug}`,
      title: article.title,
      description: article.excerpt,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale: 'fr_FR',
      siteName: 'MEEED',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://meeed.fr/a/${article.slug}`,
    },
  };
}
```

### 7.2 Sitemap dynamique

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();
  return [
    { url: 'https://meeed.fr', changeFrequency: 'daily', priority: 1 },
    ...articles.map((a) => ({
      url: `https://meeed.fr/a/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
```

---

## 8. Déploiement Heroku

### 8.1 Architecture Heroku

```
GitHub Repo
    │
    ▼ (push main → auto-deploy)
Heroku Pipeline
    ├── staging (optionnel)
    └── production (meeed.fr)
         ├── Web Dyno (Next.js)
         └── Heroku Postgres (addon)
```

### 8.2 Procfile

```
web: npm run start
release: npx prisma migrate deploy
```

### 8.3 Scripts package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start -p $PORT",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### 8.4 next.config.ts (production)

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',           // Optimise le build Heroku
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/{cloud_name}/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/a-propos-de', destination: '/a-propos', permanent: true },
      { source: '/nos-projets', destination: '/domaines', permanent: true },
      { source: '/contactez-nous', destination: '/contact', permanent: true },
      { source: '/tracteur-retrofit', destination: '/c/tracteur', permanent: true },
      { source: '/arrosage-etp', destination: '/c/arrosage', permanent: true },
    ];
  },
};

export default nextConfig;
```

### 8.5 Variables d'environnement Heroku

| Variable | Obligatoire | Description | Exemple |
|----------|-------------|-------------|---------|
| `DATABASE_URL` | Oui | Auto-injectée par Heroku Postgres | `postgresql://...` |
| `NEXTAUTH_URL` | Oui | URL publique du site | `https://meeed.fr` |
| `NEXTAUTH_SECRET` | Oui | Secret session (générer avec `openssl rand -base64 32`) | `abc123...` |
| `CLOUDINARY_CLOUD_NAME` | Oui | Cloudinary cloud name | `meeed-prod` |
| `CLOUDINARY_API_KEY` | Oui | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Oui | Cloudinary API secret | `secret...` |
| `NODE_ENV` | Oui | Auto sur Heroku | `production` |
| `PORT` | Oui | Auto sur Heroku | `3000` |

**Configuration via CLI Heroku** :

```bash
heroku config:set NEXTAUTH_URL=https://meeed.fr
heroku config:set NEXTAUTH_SECRET=$(openssl rand -base64 32)
heroku config:set CLOUDINARY_CLOUD_NAME=xxx
heroku config:set CLOUDINARY_API_KEY=xxx
heroku config:set CLOUDINARY_API_SECRET=xxx
```

### 8.6 Fichier `.env.example` (développement local)

```env
# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meeed_dev"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret-change-in-production"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 8.7 Pipeline GitHub → Heroku

1. Connecter le repo GitHub à l'app Heroku (Deploy tab)
2. Activer « Automatic deploys » sur la branche `main`
3. Optionnel : activer « Wait for CI to pass » si GitHub Actions configuré
4. Chaque push sur `main` → build → release (migrations) → deploy

### 8.8 Domaine personnalisé

```bash
heroku domains:add meeed.fr
heroku domains:add www.meeed.fr
# Configurer les DNS chez le registrar (CNAME vers Heroku)
```

---

## 9. Sécurité

| Mesure | Implémentation |
|--------|----------------|
| HTTPS | Forcé par Heroku |
| Headers sécurité | `next.config.ts` headers (CSP, X-Frame-Options) |
| Auth admin | NextAuth + middleware |
| Upload | Signatures serveur, validation MIME/taille |
| HTML éditeur | DOMPurify avant stockage |
| Rate limiting | Middleware sur `/api/upload` et `/admin/login` |
| Secrets | Variables d'environnement uniquement |
| SQL injection | Prisma (requêtes paramétrées) |

---

## 10. Monitoring et maintenance

| Outil | Usage |
|-------|-------|
| Heroku Logs | `heroku logs --tail` |
| `/api/health` | Health check (DB + Cloudinary ping) |
| Prisma Studio | Debug local (`npm run db:studio`) |
| Cloudinary Dashboard | Usage stockage/bande passante |

---

## 11. Environnements

| Env | URL | Base de données | Cloudinary |
|-----|-----|---------------|------------|
| **Local** | `localhost:3000` | PostgreSQL local / Docker | Cloud dev |
| **Staging** (optionnel) | `meeed-staging.herokuapp.com` | Heroku Postgres staging | Cloud dev |
| **Production** | `meeed.fr` | Heroku Postgres prod | Cloud prod |

---

*Document rédigé pour validation avant démarrage du développement — Étape 1 de la roadmap.*
