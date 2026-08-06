# Inventaire — notion de Domaine

Document de référence : tout ce qui touche aux **domaines** dans MEEED (pages, boutons, filtres, liaisons, services, schémas).

**Convention de nommage :** URLs publiques en français (`/domaines`) ; code et types en anglais (`Domain`, `domainId`).

**Point important :** il n’existe **pas** de page détail `/domaines/[slug]`. Un domaine mène vers la liste d’articles filtrée : `/actualites?domain={slug}`.

---

## 1. Vue d’ensemble

```
Category (1) ──< Domain (N) ──< Article (domainId optionnel)
                     │
                     └──< Document (domainId optionnel ; souvent hérité de l’Article)

Public /domaines  → getCachedActiveDomains → DomainShowcaseCard
                  → CTA « Voir les articles » → /actualites?domain=slug

Admin /admin/domaines → DomainForm / Table → domain.actions → domain.service → Prisma
Couvertures → Cloudinary meeed/domains/covers/{id|draft}
```

Règles métier clés :

- Chaque domaine **doit** avoir une `categoryId` (obligatoire).
- Plusieurs domaines peuvent partager une même catégorie.
- Un article peut être lié à un domaine (`Article.domainId`) ; pour publier : domaine **et/ou** catégories requis.
- Un document peut avoir un `domainId` direct, ou l’hériter de l’article lié.
- Suppression d’un domaine : couverture + documents du domaine purgés de Cloudinary ; articles conservés (`domainId` → `SetNull`) ; catégorie conservée.

---

## 2. Modèle de données (Prisma)

Fichier : `prisma/schema.prisma`

### 2.1 Modèle `Domain`

| Champ | Type | Notes |
|-------|------|--------|
| `id` | `String` (cuid) | Clé primaire |
| `title` | `String` | Titre |
| `slug` | `String` unique | Clé de filtre URL (`?domain=`) |
| `summary` | `String` | Accroche publique (cartes) |
| `description` | `String?` Text | Édité en admin ; **non affiché** sur `/domaines` aujourd’hui |
| `donationUrl` | `String?` | Lien HelloAsso / don par domaine |
| `coverImageUrl` | `String?` | URL de secours |
| `coverImagePublicId` | `String?` | Public ID Cloudinary |
| `color` | `String?` défaut `#4ecdc4` | Accent UI |
| `sortOrder` | `Int` défaut `0` | Ordre d’affichage public + admin DnD |
| `isActive` | `Boolean` défaut `true` | Visible / masqué |
| `categoryId` | `String` | FK obligatoire → `Category` |
| `createdAt` / `updatedAt` | `DateTime` | |

**Relations :**

| Relation | Cible | `onDelete` |
|----------|--------|------------|
| `category` | `Category` | `Cascade` |
| `articles` | `Article[]` | (inverse) |
| `documents` | `Document[]` | (inverse) |

**Index :** `categoryId` ; `[isActive, sortOrder]`

### 2.2 Champs liés sur d’autres modèles

| Modèle | Champ | Comportement |
|--------|--------|--------------|
| `Article` | `domainId?` | → Domain, `onDelete: SetNull` |
| `Category` | `domains Domain[]` | inverse |
| `Document` | `domainId?` | → Domain, `onDelete: SetNull` |

### 2.3 Migrations

| Migration | Rôle |
|-----------|------|
| `20260705144717_add_projects` | Création historique de `Project` (initialement 1:1 catégorie via unique `categoryId`) |
| `20260706105000_add_project_cover_image` | `coverImageUrl`, `coverImagePublicId` |
| `20260706120000_add_document_project` | Ajout historique de `Document.projectId` |
| `20260729193000_project_category_many_to_one` | Plusieurs entités par catégorie |
| `20260729200000_article_project` | Ajout historique de `Article.projectId` + backfill |
| `20260805113300_rename_project_to_domain` | Renommage de `Project`/`projectId` vers `Domain`/`domainId` |

### 2.4 Seed (`prisma/seed.ts`)

`INITIAL_DOMAINS` :

| Slug | Titre |
|------|--------|
| `tracteur` | Tracteur électrique en rétrofit (+ `donationUrl`) |
| `arrosage` | Arrosage automatique sur ETp |
| `energie` | Chambre fraîche adiabatique |

> **Attention :** la catégorie forum slug `"domaines"` (discussions) **n’est pas** le modèle `Domain` — homonymie uniquement.

---

## 3. Routes / pages

### 3.1 Public

| URL | Fichier | Rôle |
|-----|---------|------|
| `/domaines` | `src/app/(public)/domaines/page.tsx` | Vitrine des domaines actifs |
| `/nos-projets` → `/domaines` | `next.config.ts` | Redirection permanente |
| `/actualites?domain={slug}` | listing articles | Articles d’un domaine |
| `/actualites?type=domain` | listing articles | Tous les articles liés à un domaine |
| `/documents?domain={slug}` | listing documents | Docs d’un domaine |
| `/documents?linked=domain` | listing documents | Docs liés à **un** domaine (quelconque) |
| `/c/{categorySlug}` | `src/app/(public)/c/[slug]/page.tsx` | Groupe les articles par domaine sous la catégorie |
| `/a/{slug}` | page article | Fil d’Ariane / méta peuvent inclure le domaine |

**Absent :** `/domaines/[slug]` (pas de fiche domaine dédiée).

### 3.2 Admin (ADMIN uniquement)

| URL | Fichier |
|-----|---------|
| `/admin/domaines` | `src/app/admin/(protected)/domaines/page.tsx` |
| `/admin/domaines?q=&visibility=` | même page — recherche / filtre visibilité |
| `/admin/domaines/nouveau` | `.../nouveau/page.tsx` |
| `/admin/domaines/[id]` | `.../[id]/page.tsx` |

Layout : `src/app/admin/(protected)/domaines/layout.tsx` — `requireAdmin()` ou redirect `/admin`.

Préfixe protégé : `ADMIN_ONLY_PREFIXES` inclut `/admin/domaines` (`src/lib/auth.config.ts`).

### 3.3 SEO / sitemap

- `src/app/sitemap.ts` — entrée `/domaines` (monthly, priority 0.8)
- Métadonnées page : `buildPageMetadata({ title: "Nos domaines", path: "/domaines" })`
- Breadcrumb JsonLd sur `/domaines`
- Le champ `description` du domaine n’alimente pas de page SEO dédiée

---

## 4. Couche métier

### 4.1 Service — `src/lib/services/domain.service.ts`

| Export | Rôle |
|--------|------|
| `getActiveDomains()` | Liste publique + catégorie + dernière cover article publié + compte articles publiés |
| `getActiveDomainsForFilters()` | `{ id, title, slug }` pour toolbars / selects |
| `getAllDomainsForAdmin()` | Liste admin complète |
| `getDomainById` / `getDomainBySlug` | Lookup |
| `isDomainSlugTaken` | Unicité du slug |
| `getCategoriesAvailableForDomain` | Picker de catégorie |
| `createDomain` / `updateDomain` | CRUD |
| `reorderDomains` | Ordre glisser-déposer |
| `countDomainArticles` | Compte articles publiés |
| `deleteDomain` | Cleanup Cloudinary + docs + delete |

Types exportés : `DomainWithCategory`, `ActiveDomain`.

### 4.2 Server actions — `src/actions/domain.actions.ts`

| Action | Revalidation |
|--------|--------------|
| `createDomainAction` | `/admin/domaines`, `/domaines`, `/`, `/c/{slug}` |
| `updateDomainAction` | idem (+ nouvelle catégorie si changée) |
| `reorderDomainsAction` | admin + public domaines + home |
| `deleteDomainAction` | idem create |

Toutes exigent `requireAdmin()`. **Pas d’API REST CRUD** `/api/domains`.

### 4.3 Validations — `src/lib/validations/domain.ts`

| Schema / helper | Contenu |
|-----------------|---------|
| `createDomainSchema` | title, slug, summary, description, donationUrl, covers, color, sortOrder, isActive, categoryId |
| `updateDomainSchema` | partial de create |
| `reorderDomainsSchema` | `orderedIds[]` |
| `domainFormSchema` | alias create |
| `normalizeDomainFormInput()` | normalisation formulaire |

Types : `CreateDomainInput`, `UpdateDomainInput`, `DomainFormInput`, `ReorderDomainsInput`.

### 4.4 Cover — `src/lib/domain-cover.ts`

- `getDomainCoverUrl(domain)` — cover domaine, sinon cover du dernier article publié (`variant: "domain"`)

### 4.5 Cache — `src/lib/public-cache.ts`

- `getCachedActiveDomains` (clé `public-active-domains`, ~60s)
- `getCachedActiveDomainsForFilters`
- Cache actualités : la clé inclut `domainSlug`

### 4.6 Cloudinary — `src/lib/cloudinary.ts`

| Helper | Détail |
|--------|--------|
| `buildDomainImageFolder` | `meeed/domains/covers/{id\|draft}` |
| `getCoverDomainUrl` | 960×600 `fit` |
| `resolveCoverUrl(..., "domain")` | Résolution variante domaine |

Upload HTTP : `POST /api/upload/image` avec `purpose: "domain-cover"` et `domainId` optionnel.

---

## 5. Composants UI dédiés

### 5.1 Public

| Fichier | Export | Rôle |
|---------|--------|------|
| `src/components/domains/DomainsShowcaseList.tsx` | `DomainsShowcaseList` | Grille / liste ; `data-tour-id="domaines.grid"` |
| `src/components/domains/DomainShowcaseCard.tsx` | `DomainShowcaseCard` | Carte showcase |

### 5.2 Admin

| Fichier | Export | Rôle |
|---------|--------|------|
| `src/components/admin/DomainForm.tsx` | formulaire create/edit | Champs + actions |
| `src/components/admin/DomainsAdminTable.tsx` | `DomainsAdminTable`, `DomainTableRow` | Tableau + DnD |
| `src/components/admin/DomainsAdminToolbar.tsx` | `DomainsAdminToolbar` | Stats + recherche |
| `src/components/admin/DomainListActions.tsx` | actions ligne | Visibilité + suppression |
| `src/components/admin/DomainStatusBadge.tsx` | badge | Visible / Masqué |

---

## 6. Boutons, CTAs et liens (inventaire)

### 6.1 Navigation globale

| Emplacement | Label | Cible |
|-------------|-------|--------|
| `src/lib/navigation.ts` | « Domaines » (groupe Initiatives) | `/domaines` |
| `HeaderNav.tsx` | « Nos domaines » | `/domaines` |
| `MobileMenu.tsx` / `NavDropdown.tsx` | entrée nav | `/domaines` (`data-tour-id="nav.header.domaines"`) |
| `Footer.tsx` | « Domaines » | `/domaines` |
| `AdminSidebar.tsx` | « Domaines » (`adminOnly`) | `/admin/domaines` |
| `HomeHero.tsx` | bouton « Nos domaines » | `/domaines` |

### 6.2 Page publique `/domaines`

| Élément | Action |
|---------|--------|
| Titre du domaine (lien) | → `/actualites?domain={slug}` |
| Bouton **Voir les articles** (+ badge compte) | → `/actualites?domain={slug}` |
| Bouton **Soutenir ce domaine** (si `donationUrl`) | lien externe HelloAsso / don |
| Bouton **Soutenir l'association** (bas de page) | `HELLOASSO_URL` (`data-tour-id="domaines.donate"`) |

### 6.3 Admin `/admin/domaines`

| Élément | Action |
|---------|--------|
| **+ Nouveau domaine** | → `/admin/domaines/nouveau` |
| **Créer un domaine** (état vide) | → `/admin/domaines/nouveau` |
| **Réinitialiser les filtres** | → `/admin/domaines` |
| Onglets stats **Tous / Visibles / Masqués** | `?visibility=` |
| Bouton **Rechercher** | soumet `q` |
| Bouton **Réinitialiser** (toolbar) | clear filtres |
| Ligne : **Éditer** | → `/admin/domaines/[id]` |
| Ligne : **Voir** | → `/actualites?domain={slug}` |
| Ligne : **Masquer / Afficher** | `updateDomainAction` (`isActive`) |
| Ligne : **Supprimer** | `deleteDomainAction` |
| Glisser-déposer | `reorderDomainsAction` (désactivé si filtre/`q` actif) |

### 6.4 Formulaire domaine (`DomainForm`)

| Bouton / lien | Action |
|---------------|--------|
| Retour liste | → `/admin/domaines` |
| **Créer le domaine** / **Enregistrer** | create / update action |
| **Masquer** / **Afficher** | toggle `isActive` |
| Lien vitrine `/domaines` | aperçu public |
| **Voir les articles** | → `/c/{category.slug}` |
| **Supprimer** | confirm + `deleteDomainAction` |
| Lien **catégories** | → `/admin/categories` |
| Déverrouiller le slug | bouton unlock slug |

### 6.5 Ailleurs (liaisons UI)

| Emplacement | Élément domaine |
|-------------|----------------|
| `ArticleMeta` / cartes article | badge / lien → `/actualites?domain={slug}` |
| Page article `/a/[slug]` | breadcrumb domaine |
| Page catégorie `/c/[slug]` | liens par domaine → actualités filtrées |
| `DocumentsTable` | « Domaine : … » → `/c/{category.slug}` |
| `CategoriesManager` | affiche domaines liés ; bloque suppression catégorie s’il reste des domaines |
| `DashboardOverview` | peut afficher le titre domaine sur une ligne document |

---

## 7. Barres de recherche et filtres

### 7.1 Admin domaines

| Contrôle | Param URL | Comportement |
|----------|-----------|--------------|
| Champ recherche « Rechercher un domaine… » | `q` | Filtre titre / slug / summary (client-side après fetch admin) |
| Onglets Tous / Visibles / Masqués | `visibility=active\|hidden` | Filtre `isActive` |
| Réordonnancement DnD | — | Uniquement si **aucun** `q` ni `visibility` |

### 7.2 Actualités (public)

| Contrôle | Param | Fichiers |
|----------|-------|----------|
| Select **Domaine** | `domain={slug}` | `ArticlesFilterBar`, `ArticleFiltersModal`, `ArticlesToolbar` |
| Type **Domaines** | `type=domain` | `ArticleFiltersModal` |
| Helpers URL | `parseArticlesListingParams`, `buildArticlesUrl` | `src/lib/articles-listing.ts` |

Helpers utiles : `getLinkedDomain`, `getArticleKind` → `"domain" \| "news" \| "mixed"`.

### 7.3 Articles (admin)

| Contrôle | Param | Fichier |
|----------|-------|---------|
| Select **Domaine** | `domain={id}` (id, pas slug) | `ArticlesAdminToolbar.tsx` |
| Chip filtre actif | clear `domain` | idem |

### 7.4 Documents (public)

| Contrôle | Param | Fichiers |
|----------|-------|----------|
| Groupe filtre **Domaine** | `domain={slug}` | `DocumentsFilterPanel` |
| Chip **Liés à un domaine** | `linked=domain` | `DocumentsFilterPanel`, `DocumentsAdvancedSearch` |
| Select domaine (recherche avancée) | `domain` | `DocumentsAdvancedSearch` |
| Toolbar | passe `domains` | `DocumentsToolbar` |

Helpers : `src/lib/documents-listing.ts` — `getDocumentDomain`, `linked=domain`.

### 7.5 Forum

| Contrôle | Param | Fichiers |
|----------|-------|----------|
| Select **Domaine** | `domain={slug}` | `ForumAdvancedSearch`, `ForumToolbar` |
| Filtre SQL | jointure `Article.domainId` → `Domain.slug` | `forum-search.service.ts` |

Les facets domaines viennent de `prisma.domain.findMany` dans le service forum.

### 7.6 Formulaire article (admin)

| Contrôle | Comportement |
|----------|--------------|
| Chips **Domaine** (toggle) | set / unset `domainId` (`ArticleForm.selectDomain`) |
| Checklist publication | domaine **et/ou** catégories + cover requis |

### 7.7 Formulaires documents

| Contrôle | Comportement |
|----------|--------------|
| Select **Domaine** | `DocumentForm`, `DocumentCreateForm`, `DocumentsManager` |
| Héritage | si article lié avec `domainId` → select désactivé (« Domaine hérité de l’article lié ») |

---

## 8. Formulaires — champs domaine

### 8.1 `DomainForm` (create / edit)

| Champ | Obligatoire | Notes |
|-------|-------------|--------|
| Titre | oui | max 120 |
| Catégorie | oui | select parmi catégories disponibles |
| Image de couverture | non | `ImageUpload` `purpose="domain-cover"` |
| Couleur | non | hex `#RRGGBB` |
| Résumé | oui | 10–500 car. |
| Description | non | max 5000 ; non rendu public carte |
| Lien de don | non | URL |
| Slug | oui | auto-lockable ; regex kebab-case |
| Visibilité | — | via bouton Masquer/Afficher |

### 8.2 Autres formulaires consommant `domainId`

- **Article** : chip domaine optionnel
- **Document** : select domaine (ou héritage article)

---

## 9. Liaisons entre entités

| Entité | Lien | Détail |
|--------|------|--------|
| **Category** | FK obligatoire | `getCategoryBySlug` inclut les domaines ; suppression catégorie bloquée s’il reste des domaines |
| **Article** | `domainId?` | filtres slug / type ; articles liés par même domaine ; form via `getDomainsForArticleForm` |
| **Document** | `domainId?` ou via article | `getPublicDocumentDomains`, `getDocumentsByDomain` |
| **Forum** | via articles | filtre `domain` (slug) sur topics liés à des articles du domaine |
| **User** | aucun lien direct | seulement via auteur d’article / uploader de doc |
| **Tags** | aucun | — |

---

## 10. Médias & upload

| Pièce | Détail |
|-------|--------|
| Dossier Cloudinary | `meeed/domains/covers/{id\|draft}` |
| Purpose upload | `domain-cover` |
| Composant | `ImageUpload` accepte `domainId` |
| Fallback cover | cover du dernier article publié du domaine |
| À la suppression | `coverImagePublicId` + fichiers raw des documents du domaine |

Signing / autorisation publicIds : `upload.service.ts` / `upload.actions.ts` (préfixe `meeed/domains/`).

---

## 11. Tutoriel interactif & aide

| Fichier | Contenu |
|---------|---------|
| `src/lib/tour/subjects/pub-domaines.ts` | Tour public « Voir les domaines & faire un don » |
| `src/lib/tour/subjects/admin-domaines.ts` | Tour admin « Créer un domaine » |
| `src/lib/tour/targets.ts` | Cibles : `nav.header.domaines`, `domaines.grid/card/donate`, `admin.sidebar.domaines`, `admin.domaines.*` |
| `src/lib/tour/subjects/index.ts` | Map routes `/domaines`, `/admin/domaines` |
| `src/lib/help-content.ts` | Topic aide `admin-domaines` |

---

## 12. Scripts & docs secondaires

**Scripts :**

- `scripts/seed-demo-articles.ts` — assigne `domainId`
- `scripts/seed-ferme-solaire-articles.ts` — assigne `domainId`
- `scripts/seed-forum-discussions.ts` — catégorie forum `"domaines"` (homonymie)

**Docs mentionnant les domaines :**

`docs/cahier-des-charges.md`, `docs/architecture.md`, `docs/roadmap.md`, `docs/tests-recette-blog-forum.md` (F-09, F-44), `docs/operations.md`, `docs/functional_spec.md`, `docs/recap-fichiers.md`, docs agent / tutoriel.

---

## 13. Checklist fichiers « domaine » nommés

```
src/actions/domain.actions.ts
src/lib/services/domain.service.ts
src/lib/validations/domain.ts
src/lib/domain-cover.ts
src/components/domains/DomainShowcaseCard.tsx
src/components/domains/DomainsShowcaseList.tsx
src/components/admin/DomainForm.tsx
src/components/admin/DomainsAdminTable.tsx
src/components/admin/DomainsAdminToolbar.tsx
src/components/admin/DomainListActions.tsx
src/components/admin/DomainStatusBadge.tsx
src/app/(public)/domaines/page.tsx
src/app/admin/(protected)/domaines/layout.tsx
src/app/admin/(protected)/domaines/page.tsx
src/app/admin/(protected)/domaines/nouveau/page.tsx
src/app/admin/(protected)/domaines/[id]/page.tsx
src/lib/tour/subjects/pub-domaines.ts
src/lib/tour/subjects/admin-domaines.ts
prisma/migrations/*domain*
```

Fichiers intégrateurs (consomment / filtrent / lient des domaines) — non exhaustif mais couvrant :

- Articles : `ArticleForm`, `ArticleCard`, `ArticleCompactCard`, `ArticleMeta`, `ArticleFiltersModal`, `ArticlesFilterBar`, `ArticlesToolbar`, `ArticlesAdminToolbar`, `articles-listing.ts`, `NewsArticlesCarouselStrip`
- Documents : `DocumentForm`, `DocumentCreateForm`, `DocumentsManager`, `DocumentsFilterPanel`, `DocumentsAdvancedSearch`, `DocumentsToolbar`, `DocumentsTable`, `documents-listing.ts`
- Forum : `ForumAdvancedSearch`, `ForumToolbar`, `forum-search.service.ts`
- Catégories / nav / home : `CategoriesManager`, `HeaderNav`, `Footer`, `HomeHero`, `AdminSidebar`, `navigation.ts`
- Infra : `cloudinary.ts`, `public-cache.ts`, `auth.config.ts`, `sitemap.ts`, `ImageUpload`

---

## 14. Comportements / écarts à connaître

1. **Pas de fiche domaine** — la vitrine pointe vers les articles filtrés.
2. **`description`** stockée et éditée, non affichée sur les cartes publiques.
3. **Mutations = server actions uniquement** ; seul l’upload d’image passe par HTTP.
4. **Forum category `"domaines"`** ≠ modèle `Domain`.
5. **Admin articles** filtre par `domain` = **id** ; public/actualités/documents/forum filtrent par **slug**.

---

*Généré à partir de l’état du codebase MEEED.*
