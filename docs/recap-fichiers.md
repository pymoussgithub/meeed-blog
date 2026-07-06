# Récap fichiers — MEEED Magazine

> **Usage** : donner ce document à un LLM avec une description de bug ou de changement.  
> Le LLM doit répondre **uniquement avec le(s) chemin(s) de fichier(s)** à modifier.  
> Ensuite, uploader le fichier concerné pour obtenir les modifications précises.

**Projet** : site magazine de l'association MEEED (Next.js 15, TypeScript, Tailwind, PostgreSQL/Prisma, Cloudinary, NextAuth).

---

## Guide rapide : « Je veux changer… »

| Besoin / symptôme | Fichier(s) à ouvrir en priorité |
|-------------------|----------------------------------|
| Texte menu, liens navigation | `src/lib/navigation.ts` |
| Logo, header, menu mobile | `src/components/layout/Header.tsx`, `HeaderNav.tsx`, `MobileMenu.tsx` |
| Pied de page | `src/components/layout/Footer.tsx` |
| Couleurs, polices, styles globaux | `src/app/globals.css` |
| Page d'accueil (hero, carrousel) | `src/app/(public)/page.tsx`, `src/components/home/HomeHero.tsx`, `NewsArticlesCarousel.tsx` |
| Liste des articles (public) | `src/app/(public)/actualites/page.tsx`, `src/lib/articles-listing.ts` |
| Page article individuel | `src/app/(public)/a/[slug]/page.tsx`, `src/components/article/*` |
| Page catégorie | `src/app/(public)/c/[slug]/page.tsx` |
| Page projets (public) | `src/app/(public)/projets/page.tsx`, `src/components/projects/*` |
| Page documents (public) | `src/app/(public)/documents/page.tsx`, `src/lib/documents-listing.ts`, `src/components/document/DocumentList.tsx` |
| Page contact | `src/app/(public)/contact/page.tsx`, `src/components/contact/ContactForm.tsx` |
| Page don | `src/app/(public)/don/page.tsx` |
| Page à propos | `src/app/(public)/a-propos/page.tsx` |
| Coordonnées, email, téléphone, liens HelloAsso | `src/lib/content/site.ts` |
| Recherche | `src/app/(public)/recherche/page.tsx`, `src/components/layout/SearchForm.tsx` |
| SEO (titres, meta, OG) | `src/lib/seo.ts`, `src/app/layout.tsx`, pages individuelles |
| Redirections d'URL | `next.config.ts` |
| Connexion admin bloquée / redirection | `src/middleware.ts`, `src/lib/auth.middleware.ts`, `src/lib/auth.ts` |
| Login admin | `src/app/admin/login/page.tsx`, `src/actions/auth.actions.ts` |
| Dashboard admin | `src/app/admin/(protected)/page.tsx` |
| CRUD articles (admin) | `src/app/admin/(protected)/articles/*`, `src/components/admin/ArticleForm.tsx`, `src/actions/article.actions.ts`, `src/lib/services/article.service.ts` |
| Éditeur riche (TipTap) | `src/components/admin/TipTapEditor.tsx`, `src/lib/editor-utils.ts`, `src/lib/sanitize.ts` |
| CRUD projets (admin) | `src/app/admin/(protected)/projets/*`, `src/components/admin/ProjectForm.tsx`, `src/actions/project.actions.ts`, `src/lib/services/project.service.ts` |
| CRUD catégories (admin) | `src/app/admin/(protected)/categories/page.tsx`, `src/components/admin/CategoriesManager.tsx`, `src/actions/category.actions.ts` |
| Gestion documents (admin) | `src/app/admin/(protected)/documents/page.tsx`, `src/components/admin/DocumentsManager.tsx`, `src/actions/document.actions.ts` |
| Gestion utilisateurs (admin) | `src/app/admin/(protected)/utilisateurs/page.tsx`, `src/components/admin/UsersManager.tsx`, `src/actions/user.actions.ts` |
| Upload image / PDF | `src/components/admin/ImageUpload.tsx`, `DocumentUpload.tsx`, `src/app/api/upload/*`, `src/lib/services/upload.service.ts`, `src/lib/cloudinary.ts` |
| Téléchargement / aperçu PDF | `src/app/api/documents/[id]/download/route.ts`, `view/route.ts`, `preview/route.ts` |
| Schéma base de données | `prisma/schema.prisma` (+ migration si changement structure) |
| Données initiales (admin, catégories) | `prisma/seed.ts` |
| Erreur 404 | `src/app/not-found.tsx` |
| Erreur globale | `src/app/error.tsx` |
| Santé app (Heroku) | `src/app/api/health/route.ts` |
| Déploiement Heroku | `Procfile`, `app.json`, `scripts/build.mjs` |

---

## Architecture en 4 couches

```
Pages (src/app/)           → affichage, routing, metadata SEO
Composants (src/components/) → UI React (public + admin)
Actions (src/actions/)     → mutations serveur (formulaires admin)
Services (src/lib/services/) → logique métier + requêtes Prisma
```

**Règle** : bug d'affichage → page ou composant. Bug de sauvegarde → action + service + validation. Bug de données → schema Prisma.

---

## Pages publiques (`src/app/(public)/`)

| Fichier | Rôle |
|---------|------|
| `layout.tsx` | Enveloppe site : Header + Footer |
| `page.tsx` | Accueil |
| `actualites/page.tsx` | Liste articles |
| `a/[slug]/page.tsx` | Article détail |
| `c/[slug]/page.tsx` | Articles par catégorie |
| `projets/page.tsx` | Liste projets |
| `documents/page.tsx` | Bibliothèque PDF |
| `a-propos/page.tsx` | Présentation association |
| `contact/page.tsx` | Formulaire contact |
| `don/page.tsx` | Page don |
| `recherche/page.tsx` | Résultats recherche |

---

## Pages admin (`src/app/admin/`)

| Fichier | Rôle |
|---------|------|
| `login/page.tsx` | Connexion |
| `(protected)/layout.tsx` | Sidebar + protection session |
| `(protected)/page.tsx` | Tableau de bord |
| `(protected)/articles/page.tsx` | Liste articles |
| `(protected)/articles/nouveau/page.tsx` | Créer article |
| `(protected)/articles/[id]/page.tsx` | Éditer article |
| `(protected)/projets/page.tsx` | Liste projets |
| `(protected)/projets/nouveau/page.tsx` | Créer projet |
| `(protected)/projets/[id]/page.tsx` | Éditer projet |
| `(protected)/categories/page.tsx` | Catégories |
| `(protected)/documents/page.tsx` | Documents PDF |
| `(protected)/utilisateurs/page.tsx` | Comptes admin/contributeur |
| `(protected)/profil/page.tsx` | Profil connecté |

---

## Server Actions (`src/actions/`)

| Fichier | Rôle |
|---------|------|
| `article.actions.ts` | Créer/modifier/publier/supprimer articles |
| `project.actions.ts` | CRUD projets |
| `category.actions.ts` | CRUD catégories |
| `document.actions.ts` | CRUD documents |
| `user.actions.ts` | CRUD utilisateurs |
| `upload.actions.ts` | Upload métadonnées |
| `auth.actions.ts` | Login/logout |

---

## Services métier (`src/lib/services/`)

| Fichier | Rôle |
|---------|------|
| `article.service.ts` | Requêtes Prisma articles |
| `project.service.ts` | Requêtes Prisma projets |
| `category.service.ts` | Requêtes Prisma catégories |
| `document.service.ts` | Requêtes Prisma documents |
| `user.service.ts` | Requêtes Prisma utilisateurs |
| `upload.service.ts` | Logique upload client |
| `upload.server.ts` | Logique upload serveur |

---

## Auth & sécurité

| Fichier | Rôle |
|---------|------|
| `src/middleware.ts` | Protège `/admin/*` et `/api/upload/*` |
| `src/lib/auth.ts` | Config NextAuth |
| `src/lib/auth.config.ts` | Options auth |
| `src/lib/auth.middleware.ts` | Wrapper middleware auth |
| `src/lib/auth-helpers.ts` | Helpers session/rôles |
| `src/app/api/auth/[...nextauth]/route.ts` | Route NextAuth |

---

## API Routes (`src/app/api/`)

| Fichier | Rôle |
|---------|------|
| `upload/image/route.ts` | Upload images Cloudinary |
| `upload/document/route.ts` | Upload PDF Cloudinary |
| `documents/[id]/download/route.ts` | Téléchargement PDF |
| `documents/[id]/view/route.ts` | Visualisation PDF |
| `documents/preview/route.ts` | Aperçu PDF |
| `health/route.ts` | Health check (DB + Cloudinary) |

---

## Validations Zod (`src/lib/validations/`)

| Fichier | Valide |
|---------|--------|
| `article.ts` | Formulaires articles |
| `project.ts` | Formulaires projets |
| `category.ts` | Formulaires catégories |
| `document.ts` | Formulaires documents |
| `user.ts` | Formulaires utilisateurs |

---

## Composants clés (hors UI générique)

| Dossier / fichier | Rôle |
|-------------------|------|
| `components/layout/` | Header, Footer, nav, sidebar admin |
| `components/home/` | Sections accueil |
| `components/article/` | Cartes, contenu, filtres articles |
| `components/articles/` | Variantes liste (compact, sections) |
| `components/projects/` | Cartes et liste projets |
| `components/document/` | Liste documents public |
| `components/admin/ArticleForm.tsx` | Formulaire article complet |
| `components/admin/ProjectForm.tsx` | Formulaire projet |
| `components/admin/TipTapEditor.tsx` | Éditeur WYSIWYG |
| `components/admin/CategoriesManager.tsx` | Gestion catégories |
| `components/admin/DocumentsManager.tsx` | Gestion documents |
| `components/admin/UsersManager.tsx` | Gestion utilisateurs |
| `components/ui/` | Boutons, inputs, modales (design system) |

---

## Données & config

| Fichier | Rôle |
|---------|------|
| `prisma/schema.prisma` | Modèles : User, Article, Category, Project, Document |
| `prisma/seed.ts` | Admin par défaut + catégories initiales |
| `src/lib/prisma.ts` | Client Prisma singleton |
| `src/lib/content/site.ts` | Contact, liens HelloAsso |
| `src/lib/navigation.ts` | Liens menu principal |
| `src/lib/seo.ts` | Constantes SEO |
| `src/lib/cloudinary.ts` | Config SDK Cloudinary |
| `src/lib/sanitize.ts` | Nettoyage HTML (XSS) |
| `src/lib/articles-listing.ts` | Filtres/tri articles |
| `src/lib/documents-listing.ts` | Filtres/tri documents |
| `next.config.ts` | Build, images, redirects, headers sécu |
| `src/app/globals.css` | Tokens couleurs MEEED, typo, utilitaires |
| `.env.example` | Variables d'environnement requises |
| `public/logo-meeed.svg` | Logo site |

---

## Modèles de données (résumé)

| Entité | Champs importants |
|--------|-------------------|
| **User** | email, rôle (ADMIN/CONTRIBUTEUR), mot de passe hashé |
| **Article** | titre, slug, contenu HTML, statut (DRAFT/PUBLISHED/ARCHIVED), image couverture |
| **Category** | nom, slug, couleur, ordre |
| **Project** | titre, slug, résumé, lien don, image, lié à 1 catégorie |
| **Document** | PDF Cloudinary, lié optionnellement à article ou projet |

---

## Instructions pour le LLM lecteur

Quand l'utilisateur décrit un bug ou une modification :

1. Identifier la **zone** (public / admin / auth / upload / DB / config).
2. Consulter le tableau **« Je veux changer… »** ci-dessus.
3. Répondre avec **1 à 3 chemins de fichiers** maximum, du plus probable au moins probable.
4. Indiquer brièvement **pourquoi** ce fichier (1 phrase).
5. Ne pas proposer de code sans avoir le fichier uploadé.

**Exemple de réponse attendue** :
> Fichier principal : `src/components/layout/Footer.tsx` — le pied de page affiche les coordonnées.  
> Fichier secondaire : `src/lib/content/site.ts` — si les données contact elles-mêmes doivent changer.
