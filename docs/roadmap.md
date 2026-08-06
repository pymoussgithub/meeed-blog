# Roadmap de développement — MEEED Magazine

> **Version** : 1.0  
> **Méthode** : Développement itératif, une étape validée avant la suivante  
> **Légende** : `[ ]` à faire · `[x]` terminé

---

## Vue d'ensemble des phases

| Phase | Nom | Durée estimée | Livrable |
|-------|-----|---------------|----------|
| 0 | Documentation & cadrage | 1 jour | Specs validées ✅ |
| 1 | Initialisation projet | 0,5 jour | Projet Next.js fonctionnel |
| 2 | Base de données & Prisma | 1 jour | Schéma + seed |
| 3 | Cloudinary | 0,5 jour | Upload images/PDF |
| 4 | Authentification admin | 1 jour | Login + protection routes |
| 5 | Dashboard & édition articles | 2–3 jours | CRUD articles complet |
| 6 | Front-office magazine | 2–3 jours | Site public |
| 7 | SEO & partage WhatsApp | 1 jour | OG + sitemap |
| 8 | Déploiement Heroku | 1 jour | Site en production |
| 9 | Finitions & migration | 1–2 jours | Redirections, contenu initial |

**Estimation totale** : 10–14 jours de développement

---

## Phase 0 — Documentation & cadrage

- [x] Rédiger `docs/functional_spec.md`
- [x] Rédiger `docs/architecture.md`
- [x] Rédiger `docs/roadmap.md`
- [ ] **Validation conjointe des 3 documents**
- [ ] Créer compte Cloudinary (si inexistant)
- [ ] Créer app Heroku (si inexistante)
- [ ] Récupérer assets du site actuel (logo, favicon, images clés)

---

## Phase 1 — Initialisation du projet

### 1.1 Scaffold Next.js

- [ ] Créer le projet Next.js 15 avec App Router, TypeScript, Tailwind CSS, ESLint
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```
- [ ] Vérifier que `npm run dev` démarre sur `localhost:3000`
- [ ] Configurer `tsconfig.json` (strict mode, paths `@/*`)

### 1.2 Structure de dossiers

- [ ] Créer l'arborescence `src/app/(public)/`, `src/app/admin/`, `src/components/`, `src/lib/`, `src/actions/`, `src/types/`
- [ ] Créer les fichiers placeholder pour les routes principales (pages vides)
- [ ] Ajouter `.env.example` avec toutes les variables documentées
- [ ] Configurer `.gitignore` (`.env`, `node_modules`, `.next`, etc.)

### 1.3 Design tokens & charte graphique

- [ ] Configurer `tailwind.config.ts` avec les couleurs MEEED :
  - `primary: #292f36`
  - `accent: #4ecdc4`
  - `accent-blue: #4EBDF5`
  - `accent-green: #20c997`
- [ ] Importer les polices Chivo et Roboto (Google Fonts ou `next/font`)
- [ ] Créer `src/app/globals.css` avec les variables CSS custom
- [ ] Copier le logo MEEED dans `public/logo-meeed.png`
- [ ] Créer une image OG par défaut `public/og-default.jpg`

### 1.4 Composants UI de base

- [ ] Installer et configurer `clsx` + `tailwind-merge` (helper `cn()`)
- [ ] Créer composants atomiques dans `src/components/ui/` :
  - [ ] `Button.tsx` (variants : primary, accent, outline, ghost)
  - [ ] `Input.tsx`
  - [ ] `Textarea.tsx`
  - [ ] `Badge.tsx` (pour catégories)
  - [ ] `Card.tsx`
  - [ ] `Spinner.tsx`
  - [ ] `Toast.tsx` (notifications)

### 1.5 README projet

- [ ] Rédiger `README.md` avec instructions d'installation locale
- [ ] Documenter les prérequis (Node 20+, PostgreSQL, compte Cloudinary)

**✅ Critère de validation Phase 1** : Projet démarre, page d'accueil placeholder avec header MEEED (logo + couleurs), structure de dossiers en place.

---

## Phase 2 — Base de données & Prisma

### 2.1 Installation Prisma

- [ ] Installer Prisma : `npm install prisma @prisma/client`
- [ ] Initialiser : `npx prisma init`
- [ ] Configurer `DATABASE_URL` dans `.env` (PostgreSQL local ou Docker)

### 2.2 Schéma de données

- [ ] Écrire `prisma/schema.prisma` complet (User, Article, Category, ArticleCategory, Document)
- [ ] Définir les énumérations `UserRole` et `ArticleStatus`
- [ ] Configurer les index et relations
- [ ] Exécuter la première migration : `npx prisma migrate dev --name init`

### 2.3 Client Prisma

- [ ] Créer `src/lib/prisma.ts` (singleton pattern pour éviter les connexions multiples)
- [ ] Tester une requête simple en dev

### 2.4 Seed initial

- [ ] Créer `prisma/seed.ts` avec :
  - [ ] 1 utilisateur admin (`admin@meeed.fr` — mot de passe à changer)
  - [ ] Catégories initiales : `Tracteur`, `Arrosage`, `Énergie`, `Formation`, `Actualités`
  - [ ] 1 article de démonstration (brouillon)
- [ ] Configurer `"prisma": { "seed": "tsx prisma/seed.ts" }` dans `package.json`
- [ ] Exécuter : `npx prisma db seed`
- [ ] Vérifier les données via `npx prisma studio`

### 2.5 Services de base

- [ ] Créer `src/lib/services/article.service.ts` (getPublished, getBySlug, create, update)
- [ ] Créer `src/lib/services/category.service.ts` (getAll, getBySlug)
- [ ] Créer `src/lib/services/document.service.ts` (getPublic, getByArticle)
- [ ] Créer les schémas Zod dans `src/lib/validations/`

**✅ Critère de validation Phase 2** : Base peuplée, requêtes Prisma fonctionnelles, Prisma Studio affiche les données.

---

## Phase 3 — Configuration Cloudinary

### 3.1 Installation & config

- [ ] Installer SDK : `npm install cloudinary`
- [ ] Créer `src/lib/cloudinary.ts` avec configuration et helpers
- [ ] Implémenter `getCloudinaryUrl()` et `getOgImageUrl()`
- [ ] Tester la connexion Cloudinary (upload manuel via script)

### 3.2 API Routes upload

- [ ] Créer `src/app/api/upload/image/route.ts`
  - [ ] Générer signature upload signé
  - [ ] Retourner `{ signature, timestamp, cloudName, apiKey, folder }`
  - [ ] Protéger par authentification (session requise)
- [ ] Créer `src/app/api/upload/document/route.ts`
  - [ ] Même logique pour PDF (`resource_type: raw`)
  - [ ] Validation MIME type et taille max

### 3.3 Composant FileUpload

- [ ] Créer `src/components/admin/FileUpload.tsx`
  - [ ] Zone drag & drop
  - [ ] Barre de progression
  - [ ] Preview image après upload
  - [ ] Gestion erreurs (taille, format)
- [ ] Créer `src/components/admin/ImageUpload.tsx` (spécialisé images, avec crop suggestion 16:9)

### 3.4 Service upload

- [ ] Créer `src/lib/services/upload.service.ts`
  - [ ] `saveImageMetadata(publicId, url, articleId?)`
  - [ ] `saveDocumentMetadata(publicId, url, fileName, fileSize, articleId?)`
  - [ ] `deleteFromCloudinary(publicId, resourceType)`

**✅ Critère de validation Phase 3** : Upload d'une image et d'un PDF depuis un script ou page de test, fichiers visibles dans le dashboard Cloudinary.

---

## Phase 4 — Authentification admin

### 4.1 Installation NextAuth

- [ ] Installer : `npm install next-auth@beta @auth/prisma-adapter bcryptjs`
- [ ] Installer types : `npm install -D @types/bcryptjs`
- [ ] Créer `src/lib/auth.ts` (config NextAuth v5, Credentials provider)
- [ ] Créer `src/app/api/auth/[...nextauth]/route.ts`

### 4.2 Pages auth

- [ ] Créer `src/app/admin/login/page.tsx`
  - [ ] Formulaire email + mot de passe
  - [ ] Gestion erreurs (identifiants invalides)
  - [ ] Redirection vers `/admin` après login
  - [ ] Design sobre, logo MEEED
- [ ] Créer `src/app/admin/layout.tsx`
  - [ ] Vérification session (redirect si non auth)
  - [ ] Layout avec sidebar admin

### 4.3 Middleware protection

- [ ] Créer `src/middleware.ts`
  - [ ] Protéger toutes les routes `/admin/*` (sauf `/admin/login`)
  - [ ] Protéger les API routes `/api/upload/*`
  - [ ] Vérifier rôle ADMIN pour `/admin/utilisateurs` et `/admin/categories`

### 4.4 Composants admin layout

- [ ] Créer `src/components/layout/AdminSidebar.tsx` (navigation : Dashboard, Articles, Documents, Catégories, Utilisateurs, Déconnexion)
- [ ] Créer `src/components/layout/AdminHeader.tsx` (nom utilisateur, bouton déconnexion)

### 4.5 Helpers auth

- [ ] Créer `src/lib/auth-helpers.ts` (`getCurrentUser()`, `requireAuth()`, `requireAdmin()`)
- [ ] Créer Server Action `signOut`

**✅ Critère de validation Phase 4** : Login fonctionnel avec le compte seed, accès `/admin` protégé, déconnexion OK.

---

## Phase 5 — Dashboard & édition d'articles

### 5.1 Dashboard admin

- [ ] Créer `src/app/admin/page.tsx`
  - [ ] Statistiques simples (articles publiés, brouillons, documents)
  - [ ] Liste des 5 derniers articles
  - [ ] Bouton « + Nouvel article » proéminent
  - [ ] Liste des brouillons de l'utilisateur connecté

### 5.2 Liste des articles

- [ ] Créer `src/app/admin/articles/page.tsx`
  - [ ] Tableau : titre, statut, auteur, date, catégorie(s)
  - [ ] Filtres : statut, catégorie, recherche
  - [ ] Actions : éditer, archiver
  - [ ] Pagination

### 5.3 Éditeur d'articles

- [ ] Installer TipTap : `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link`
- [ ] Créer `src/components/admin/TipTapEditor.tsx`
  - [ ] Barre d'outils : H2, H3, gras, italique, listes, lien, image
  - [ ] Bouton insertion image → ouvre ImageUpload
  - [ ] Retourne HTML propre
- [ ] Créer `src/components/admin/ArticleForm.tsx`
  - [ ] Champs : titre, slug (auto-généré), catégories (multi-select), excerpt, cover image, contenu, statut
  - [ ] Validation Zod côté client et serveur
  - [ ] Boutons : Enregistrer brouillon, Publier, Aperçu
  - [ ] Compteur caractères excerpt (max 160)

### 5.4 Pages création / édition

- [ ] Créer `src/app/admin/articles/nouveau/page.tsx`
- [ ] Créer `src/app/admin/articles/[id]/page.tsx`
  - [ ] Charger l'article existant
  - [ ] Pré-remplir le formulaire
  - [ ] Gérer les permissions (contributeur = ses articles uniquement)

### 5.5 Server Actions articles

- [ ] Créer `src/actions/article.actions.ts`
  - [ ] `createArticle(data)` → brouillon
  - [ ] `updateArticle(id, data)`
  - [ ] `publishArticle(id)` → vérifie champs obligatoires
  - [ ] `archiveArticle(id)`
  - [ ] `deleteArticle(id)` → archive en réalité
- [ ] Sanitization HTML avec DOMPurify avant sauvegarde

### 5.6 Gestion des documents (admin)

- [ ] Créer `src/app/admin/documents/page.tsx`
  - [ ] Liste des documents uploadés
  - [ ] Upload nouveau PDF (drag & drop)
  - [ ] Associer à un article (select)
  - [ ] Toggle public/privé
- [ ] Créer `src/actions/document.actions.ts`

### 5.7 Gestion des catégories (admin)

- [ ] Créer `src/app/admin/categories/page.tsx`
  - [ ] CRUD catégories (nom, slug, description, couleur)
  - [ ] Réordonnancement (sortOrder)
- [ ] Créer `src/actions/category.actions.ts`

### 5.8 Gestion des utilisateurs (admin only)

- [ ] Créer `src/app/admin/utilisateurs/page.tsx`
  - [ ] Liste des utilisateurs
  - [ ] Créer un compte contributeur (nom, email, mot de passe temporaire)
  - [ ] Activer/désactiver un compte
  - [ ] Changer le rôle

**✅ Critère de validation Phase 5** : Un contributeur peut créer, éditer, publier un article avec image de couverture et PDF associé, en moins de 5 minutes.

---

## Phase 6 — Front-office magazine

### 6.1 Layout public

- [ ] Créer `src/app/(public)/layout.tsx`
  - [ ] Header : logo, navigation (Accueil, Catégories, Documents, À propos, Contact)
  - [ ] Footer : logo, coordonnées, liens, mention loi 1901
  - [ ] Responsive mobile (menu hamburger)
- [ ] Créer `src/components/layout/Header.tsx`
- [ ] Créer `src/components/layout/Footer.tsx`
- [ ] Créer `src/components/layout/MobileMenu.tsx`

### 6.2 Page d'accueil

- [ ] Créer `src/app/(public)/page.tsx`
  - [ ] Article à la une (dernier publié ou flag `featured` — V2)
  - [ ] Grille d'articles récents (9 par page)
  - [ ] Pagination
  - [ ] Section « Nos thématiques » (liens catégories)
- [ ] Créer `src/components/article/ArticleCard.tsx`
- [ ] Créer `src/components/article/FeaturedArticle.tsx`

### 6.3 Page article

- [ ] Créer `src/app/(public)/a/[slug]/page.tsx`
  - [ ] Server Component, fetch article par slug
  - [ ] 404 si article inexistant ou non publié
  - [ ] Rendu : hero image, titre, métadonnées, contenu HTML, documents
  - [ ] Articles similaires (même catégorie, 3 max)
- [ ] Créer `src/components/article/ArticleHero.tsx`
- [ ] Créer `src/components/article/ArticleContent.tsx` (rendu HTML sécurisé)
- [ ] Créer `src/components/article/ArticleMeta.tsx` (date, auteur, catégories)
- [ ] Créer `src/components/article/ShareBar.tsx` (WhatsApp + copier lien)
- [ ] Créer `src/components/document/DocumentList.tsx`

### 6.4 Page catégorie

- [ ] Créer `src/app/(public)/c/[slug]/page.tsx`
  - [ ] Titre et description de la catégorie
  - [ ] Grille d'articles filtrés
  - [ ] Pagination

### 6.5 Page documents

- [ ] Créer `src/app/(public)/documents/page.tsx`
  - [ ] Liste de tous les documents publics
  - [ ] Filtre par catégorie
  - [ ] Recherche par titre
  - [ ] Bouton téléchargement direct

### 6.6 Pages institutionnelles

- [ ] Créer `src/app/(public)/a-propos/page.tsx` (reprise contenu site actuel)
- [ ] Créer `src/app/(public)/contact/page.tsx` (email, formulaire simple ou lien)
- [ ] Créer `src/app/(public)/domaines/page.tsx` (hub domaines → liens catégories/articles)

### 6.7 Recherche

- [ ] Créer `src/app/(public)/recherche/page.tsx`
  - [ ] Barre de recherche (aussi dans le header)
  - [ ] Résultats full-text (titre + excerpt + contenu)
  - [ ] Pagination

### 6.8 Pages erreur

- [ ] Créer `src/app/not-found.tsx` (404 stylé MEEED)
- [ ] Créer `src/app/error.tsx` (erreur générique)

**✅ Critère de validation Phase 6** : Site public navigable sur mobile, articles lisibles, documents téléchargeables, design cohérent MEEED.

---

## Phase 7 — Optimisation SEO & partage WhatsApp

### 7.1 Métadonnées dynamiques

- [ ] Implémenter `generateMetadata()` sur `/a/[slug]` (OG complet)
- [ ] Implémenter métadonnées sur `/c/[slug]`, `/documents`, pages statiques
- [ ] Configurer `metadataBase` dans le root layout
- [ ] Image OG par défaut pour les pages sans image dédiée

### 7.2 Données structurées

- [ ] Ajouter JSON-LD `Organization` sur la page d'accueil
- [ ] Ajouter JSON-LD `Article` sur chaque page article
- [ ] Ajouter JSON-LD `BreadcrumbList` sur les pages internes

### 7.3 Sitemap & robots

- [ ] Créer `src/app/sitemap.ts` (dynamique, articles + catégories + pages statiques)
- [ ] Créer `src/app/robots.ts` (autoriser `/`, bloquer `/admin`, `/api`)

### 7.4 Partage WhatsApp

- [ ] Implémenter `ShareBar` avec lien `https://wa.me/?text={title}%20{url}`
- [ ] Bouton « Copier le lien » avec feedback toast
- [ ] Tester le rendu OG avec Facebook Sharing Debugger sur 3 articles types

### 7.5 Performance

- [ ] Configurer `next/image` avec domaine Cloudinary
- [ ] Lazy loading images below the fold
- [ ] Vérifier les Core Web Vitals en local (Lighthouse mobile)
- [ ] Optimiser les polices avec `next/font` (preload)

### 7.6 Redirections anciennes URLs

- [ ] Configurer les redirections 301 dans `next.config.ts` :
  - [ ] `/a-propos-de` → `/a-propos`
  - [ ] `/nos-projets` → `/domaines`
  - [ ] `/contactez-nous` → `/contact`
  - [ ] `/tracteur-retrofit` → `/c/tracteur` (ou article dédié)
  - [ ] `/arrosage-etp` → `/c/arrosage`

**✅ Critère de validation Phase 7** : Partage d'un article sur WhatsApp affiche titre + image + description. Score Lighthouse mobile > 85.

---

## Phase 8 — Configuration & déploiement Heroku

### 8.1 Configuration build

- [ ] Créer `Procfile` :
  ```
  web: npm run start
  release: npx prisma migrate deploy
  ```
- [ ] Configurer `package.json` scripts (`build`, `start`, `postinstall`)
- [ ] Configurer `next.config.ts` (`output: 'standalone'`, `images.remotePatterns`)
- [ ] Créer `app.json` pour Heroku (description, addons, env vars template)

### 8.2 Préparation Heroku

- [ ] Créer l'application Heroku (production)
- [ ] Ajouter l'addon Heroku Postgres
- [ ] Configurer toutes les variables d'environnement (voir `architecture.md` §8.5)
- [ ] Connecter le repo GitHub
- [ ] Activer le déploiement automatique (branche `main`)

### 8.3 Premier déploiement

- [ ] Push sur `main` → vérifier le build Heroku
- [ ] Vérifier que les migrations Prisma s'exécutent (release phase)
- [ ] Exécuter le seed en production (manuellement une fois) :
  ```bash
  heroku run npx prisma db seed
  ```
- [ ] Changer le mot de passe admin par défaut

### 8.4 Domaine & SSL

- [ ] Configurer le domaine `meeed.fr` sur Heroku
- [ ] Configurer `www.meeed.fr` (redirect vers apex ou inverse)
- [ ] Mettre à jour les DNS chez le registrar
- [ ] Vérifier le certificat SSL automatique
- [ ] Mettre à jour `NEXTAUTH_URL` avec le domaine final

### 8.5 Health check

- [ ] Créer `src/app/api/health/route.ts`
  - [ ] Vérifie connexion PostgreSQL (`SELECT 1`)
  - [ ] Retourne `{ status: "ok", timestamp }` ou 503
- [ ] Configurer Heroku health check (optionnel)

### 8.6 Monitoring

- [ ] Vérifier les logs Heroku après déploiement
- [ ] Tester le site en production (navigation complète)
- [ ] Tester le login admin en production
- [ ] Tester un upload image/PDF en production

**✅ Critère de validation Phase 8** : Site accessible sur `meeed.fr`, admin fonctionnel, HTTPS actif.

---

## Phase 9 — Finitions & migration de contenu

### 9.1 Contenu initial

- [ ] Rédiger et publier les 3 premiers articles (un par domaine phare) :
  - [ ] Tracteur électrique en rétrofit
  - [ ] Arrosage automatique sur ETp
  - [ ] Chambre fraîche adiabatique
- [ ] Migrer les textes des pages institutionnelles
- [ ] Uploader les PDF existants (dossiers domaines)
- [ ] Vérifier toutes les images et liens

### 9.2 Tests utilisateur

- [ ] Test complet du parcours contributeur (création article de A à Z)
- [ ] Test sur mobile réel (iPhone + Android)
- [ ] Test partage WhatsApp depuis mobile
- [ ] Test téléchargement PDF
- [ ] Test recherche

### 9.3 Corrections & polish

- [ ] Corriger les bugs identifiés lors des tests
- [ ] Ajuster les espacements / responsive si nécessaire
- [ ] Vérifier l'accessibilité (contrastes, alt text, navigation clavier)
- [ ] Vérifier les textes (fautes, cohérence tonale)

### 9.4 Documentation finale

- [ ] Mettre à jour le `README.md` avec instructions de déploiement
- [ ] Rédiger un guide contributeur simple (1 page PDF ou page `/admin/aide`)
- [ ] Documenter la procédure de backup base de données

### 9.5 Bascule DNS

- [ ] Communiquer la date de bascule aux parties prenantes
- [ ] Basculer les DNS de `meeed.fr` vers Heroku
- [ ] Vérifier que les redirections 301 fonctionnent
- [ ] Désactiver l'ancien site Infomaniak (après période de transition)

**✅ Critère de validation Phase 9** : Site en production avec contenu réel, validé par un contributeur non technique, partage WhatsApp fonctionnel.

---

## Backlog V2 (hors périmètre V1)

Ces fonctionnalités sont notées pour une événuelle version ultérieure :

- [ ] Publication programmée (date future)
- [ ] Article « à la une » sélectionnable manuellement
- [ ] Statistiques de lecture (page views par article)
- [ ] Intégration Google Analytics / Plausible
- [ ] Newsletter (Mailchimp / Brevo)
- [ ] Commentaires modérés
- [ ] Version anglaise
- [ ] Export PDF d'un article
- [ ] Galerie photos par domaine
- [ ] Intégration vidéo (YouTube embed + hébergement)
- [ ] PWA (installation sur mobile)
- [ ] Mode hors-ligne (service worker)

---

## Notes de suivi

| Date | Phase | Commentaire |
|------|-------|-------------|
| 2026-07-05 | 0 | Création des documents de spécification |
| | | |
| | | |

---

*Cocher les tâches au fur et à mesure de l'avancement. Valider chaque phase avant de passer à la suivante.*
