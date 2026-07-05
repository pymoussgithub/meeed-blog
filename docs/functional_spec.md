# Spécifications fonctionnelles — MEEED Magazine

> **Projet** : Nouveau site/blog magazine de l'association MEEED  
> **Domaine cible** : `meeed.fr`  
> **Version** : 1.0 — Document de cadrage (Étape 0)  
> **Objectif produit** : *Publier, partager.*

---

## 1. Contexte et vision produit

### 1.1 Présentation de l'association

**MEEED** (*Maraichage Efficient en Eau et en Energie Décarbonée*) est une association loi 1901 d'intérêt général qui développe et diffuse des solutions technologiques pour un maraîchage plus efficient en eau et en énergie, orienté vers la décarbonation.

Ses missions principales :
- Établir et maintenir un savoir-faire sur des solutions applicables au maraîchage de petite et moyenne dimension ;
- Communiquer, informer et former pour diffuser ce savoir-faire auprès du monde agricole ;
- Développer des innovations et prototypes adaptés ;
- Mettre à disposition des dossiers réplicables et des documents techniques.

### 1.2 Problème du site actuel

Le site actuel ([meeed.fr](https://meeed.fr/)) est un site vitrine statique (Infomaniak Site Creator). Il ne permet pas :
- une publication régulière d'actualités par plusieurs contributeurs ;
- un partage social optimisé (WhatsApp, Facebook, etc.) ;
- un dépôt centralisé et structuré de documents (PDF, fiches techniques) ;
- une administration simple pour des utilisateurs non techniques.

### 1.3 Vision du nouveau produit

Remplacer le site vitrine par un **magazine en ligne** dynamique, collaboratif et mobile-first, tout en conservant l'identité visuelle MEEED.

| Priorité | Description |
|----------|-------------|
| **P1** | Publier des articles d'actualité facilement |
| **P1** | Partager sur WhatsApp avec un aperçu riche (titre, image, description) |
| **P1** | Rendre les documents de l'association accessibles au public |
| **P2** | Organiser le contenu par catégories/thématiques |
| **P2** | Permettre la collaboration multi-contributeurs |
| **P3** | Conserver des pages institutionnelles essentielles (À propos, Contact) |

---

## 2. Personas et rôles utilisateurs

### 2.1 Lecteur (public)

| Attribut | Détail |
|----------|--------|
| **Profil** | Maraîcher, agriculteur, partenaire, curieux du grand public |
| **Contexte** | Consultation majoritairement sur mobile, souvent via un lien WhatsApp |
| **Besoins** | Lire rapidement, télécharger des documents, partager à son réseau |
| **Compétences techniques** | Faibles — l'interface doit être évidente |

### 2.2 Contributeur

| Attribut | Détail |
|----------|--------|
| **Profil** | Responsable de projet MEEED, membre interne, contributeur externe |
| **Besoins** | Rédiger un article, ajouter une image, joindre un PDF, prévisualiser, publier |
| **Compétences techniques** | Très faibles — interface « enfantine » requise |
| **Frustrations à éviter** | Markdown brut, gestion de fichiers complexe, jargon technique |

### 2.3 Administrateur

| Attribut | Détail |
|----------|--------|
| **Profil** | Responsable communication ou direction de l'association |
| **Besoins** | Gérer les comptes contributeurs, modérer, archiver, voir les statistiques basiques |
| **Périmètre** | Tous les droits contributeur + gestion des utilisateurs et catégories |

---

## 3. Parcours utilisateur — Côté lecteur (Front-office)

### 3.1 Page d'accueil — Magazine

**URL** : `/`

**Contenu affiché** :
- En-tête : logo MEEED, navigation simplifiée (Accueil, Catégories, À propos, Contact)
- Article à la une (le plus récent ou épinglé manuellement)
- Grille d'articles récents (cartes avec image, titre, extrait, catégorie, date)
- Bandeau optionnel : lien vers donation HelloAsso (conservé du site actuel)
- Pied de page : coordonnées, liens institutionnels, mentions légales

**Comportement mobile** :
- Grille 1 colonne sur mobile
- Images lazy-loadées, format optimisé (WebP via Cloudinary)
- Temps de chargement cible : LCP < 2,5 s sur 4G

### 3.2 Page article

**URL** : `/a/{slug}`

Exemples :
- `/a/tracteur-electrique-retrofit`
- `/a/arrosage-automatique-etp`

**Règles de slug** :
- Généré automatiquement depuis le titre (translittération, minuscules, tirets)
- Modifiable manuellement par le contributeur avant publication
- Unique, max 80 caractères
- Pas de date dans l'URL (permet le partage durable)
- Caractères autorisés : `a-z`, `0-9`, `-`

**Contenu affiché** :
- Titre (H1)
- Métadonnées : date de publication, auteur, catégorie(s)
- Image de couverture (hero)
- Corps de l'article (HTML riche issu de l'éditeur)
- Bloc « Documents associés » (PDF téléchargeables)
- Boutons de partage : WhatsApp, copier le lien, (optionnel : Facebook, LinkedIn)
- Articles similaires / récents (3 suggestions)

### 3.3 Page catégorie

**URL** : `/c/{slug}`

Exemples :
- `/c/tracteur`
- `/c/arrosage`
- `/c/energie`

**Contenu** : liste paginée des articles de la catégorie, triés par date décroissante.

### 3.4 Page documents (bibliothèque publique)

**URL** : `/documents`

**Contenu** : liste de tous les documents PDF publiés, filtrables par catégorie et recherche textuelle. Chaque entrée affiche : titre, description courte, type, taille, date, bouton téléchargement.

### 3.5 Pages institutionnelles

| Page | URL proposée | Source |
|------|--------------|--------|
| À propos | `/a-propos` | Reprise contenu actuel |
| Contact | `/contact` | Formulaire simple ou lien email |
| Nos projets | `/projets` | Page hub listant les projets (peut pointer vers des catégories ou articles) |

> **Note migration** : Des redirections 301 seront configurées depuis les anciennes URLs (`/a-propos-de` → `/a-propos`, `/nos-projets` → `/projets`, etc.).

### 3.6 Recherche

**URL** : `/recherche?q={terme}`

Recherche full-text sur les titres, extraits et contenus d'articles. Résultats paginés.

---

## 4. Partage WhatsApp et métadonnées sociales

### 4.1 Enjeu business

Le partage WhatsApp est le canal principal de diffusion pour la cible agricole. Un lien partagé doit afficher immédiatement :
- Un **titre** accrocheur et lisible
- Une **image** de couverture de qualité (ratio 1.91:1 recommandé, min 1200×630 px)
- Une **description** courte (120–160 caractères)

### 4.2 Implémentation Open Graph

Chaque page article génère dynamiquement :

```html
<meta property="og:type" content="article" />
<meta property="og:url" content="https://meeed.fr/a/{slug}" />
<meta property="og:title" content="{titre article}" />
<meta property="og:description" content="{extrait ou meta description}" />
<meta property="og:image" content="{URL Cloudinary image couverture — format og}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="fr_FR" />
<meta property="og:site_name" content="MEEED" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{titre}" />
<meta name="twitter:description" content="{extrait}" />
<meta name="twitter:image" content="{URL image}" />
```

### 4.3 Règles éditoriales pour le partage

| Champ | Règle |
|-------|-------|
| **Titre** | Max 70 caractères recommandé pour WhatsApp |
| **Extrait** | 120–160 caractères, rédigé manuellement ou auto-généré depuis le début du contenu |
| **Image de couverture** | Obligatoire à la publication ; crop 16:9 ou 1.91:1 suggéré à l'upload |
| **URL canonique** | Toujours `https://meeed.fr/a/{slug}` (pas de paramètres) |

### 4.4 Bouton de partage WhatsApp

```
https://wa.me/?text={titre}%20-%20{url_encodee}
```

Affiché en sticky ou en fin d'article sur mobile.

### 4.5 Validation

- Tester chaque article publié avec le [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (utilisé aussi par WhatsApp)
- Sitemap XML automatique pour le SEO
- `robots.txt` autorisant l'indexation du front-office, bloquant `/admin`

---

## 5. Parcours utilisateur — Côté contributeur (Back-office)

### 5.1 Accès

**URL** : `/admin`  
**Authentification** : email + mot de passe (session sécurisée, cookies httpOnly)

### 5.2 Dashboard

Vue d'ensemble après connexion :
- Mes brouillons (articles non publiés)
- Articles publiés récents
- Bouton principal : **« + Nouvel article »**
- Accès rapide : Documents, Catégories (admin uniquement)

### 5.3 Création / édition d'article

**URL** : `/admin/articles/nouveau` | `/admin/articles/{id}`

#### Interface en une seule page (formulaire progressif)

| Étape | Champ | Type | Obligatoire |
|-------|-------|------|-------------|
| 1 | Titre | Texte | Oui |
| 2 | Slug (URL) | Texte auto-généré, modifiable | Oui |
| 3 | Catégorie(s) | Sélection multiple | Au moins 1 |
| 4 | Image de couverture | Upload (drag & drop) | Oui pour publication |
| 5 | Extrait (partage social) | Textarea 160 car. max | Oui pour publication |
| 6 | Contenu | Éditeur riche WYSIWYG | Oui |
| 7 | Documents associés | Upload PDF multiple | Non |
| 8 | Statut | Brouillon / Publié / Archivé | Oui |

#### Éditeur de contenu

- **Type** : WYSIWYG simple (TipTap ou équivalent)
- **Fonctions** : titres (H2, H3), gras, italique, listes, liens, citations, insertion d'image inline
- **Pas de** : tableaux complexes, code HTML brut, shortcodes
- **Insertion d'image** : bouton dédié → upload Cloudinary → insertion automatique dans le texte
- **Prévisualisation** : bouton « Aperçu » ouvrant le rendu front-office

#### Actions disponibles

- **Enregistrer brouillon** : sauvegarde sans publication
- **Publier** : rend l'article visible immédiatement
- **Programmer** (V2 optionnelle) : date de publication future
- **Archiver** : retire de la vue publique, conserve en base

### 5.4 Gestion des documents

**URL** : `/admin/documents`

- Upload PDF via drag & drop
- Métadonnées : titre, description, catégorie optionnelle, rattachement à un article optionnel
- Fichiers stockés sur Cloudinary (`resource_type: raw` pour PDF)
- URL de téléchargement publique générée automatiquement

### 5.5 Gestion des catégories (Admin)

**URL** : `/admin/categories`

- CRUD simple : nom, slug, description, couleur (optionnel), ordre d'affichage
- Impossible de supprimer une catégorie contenant des articles publiés (archivage uniquement)

### 5.6 Gestion des utilisateurs (Admin)

**URL** : `/admin/utilisateurs`

- Inviter un contributeur par email
- Rôles : `ADMIN` | `CONTRIBUTEUR`
- Désactiver un compte (soft delete)

---

## 6. Charte graphique et UI/UX

### 6.1 Identité visuelle (extraite du site actuel)

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#292f36` | Textes, header, footer, boutons secondaires |
| `--color-accent` | `#4ecdc4` | CTA, liens actifs, séparateurs, badges |
| `--color-accent-blue` | `#4EBDF5` | Accents UI secondaires |
| `--color-accent-green` | `#20c997` | Séparateurs, highlights |
| `--color-bg` | `#ffffff` | Fond principal |
| `--color-bg-soft` | `#d3f3f0` (`#4ecdc4` à 25%) | Fonds de section |
| `--font-heading` | Chivo | Titres, boutons |
| `--font-body` | Roboto | Corps de texte |
| **Logo** | `meeedlogoimage.png` | Header + footer + favicon |

### 6.2 Principes UX

1. **Mobile-first** : concevoir pour 375 px, enrichir pour desktop
2. **Sobriété** : beaucoup d'espace blanc, typographie lisible (16 px min corps)
3. **Lisibilité** : contrastes WCAG AA minimum
4. **Efficacité admin** : maximum 3 clics pour publier un article
5. **Feedback** : toasts de confirmation (« Article publié ! », « Document ajouté »)

### 6.3 Composants clés

| Composant | Description |
|-----------|-------------|
| `ArticleCard` | Image, catégorie (badge teal), titre, extrait, date |
| `ArticleHero` | Image pleine largeur, titre overlay ou dessous |
| `DocumentList` | Icône PDF, titre, taille, bouton télécharger |
| `ShareBar` | WhatsApp + copier lien, sticky en bas sur mobile |
| `CategoryBadge` | Pastille colorée avec nom de catégorie |
| `AdminSidebar` | Navigation latérale simple, icônes + labels |

---

## 7. Modèle de données

### 7.1 Schéma entité-relation

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    User     │       │     Article      │       │  Category   │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id          │──┐    │ id               │    ┌──│ id          │
│ email       │  │    │ title            │    │  │ name        │
│ name        │  └───>│ slug (unique)    │    │  │ slug        │
│ passwordHash│       │ excerpt          │    │  │ description │
│ role        │       │ content (HTML)   │    │  │ color       │
│ isActive    │       │ coverImageUrl    │    │  │ sortOrder   │
│ createdAt   │       │ coverImageId     │    │  │ createdAt   │
│ updatedAt   │       │ status           │    │  └─────────────┘
└─────────────┘       │ publishedAt      │    │
                      │ authorId (FK)    │    │
                      │ createdAt        │    │
                      │ updatedAt        │    │
                      └────────┬─────────┘    │
                               │              │
                      ┌────────┴─────────┐    │
                      │ ArticleCategory  │<───┘
                      │ (table pivot)    │
                      ├──────────────────┤
                      │ articleId (FK)   │
                      │ categoryId (FK)  │
                      └──────────────────┘

┌─────────────┐       ┌──────────────────┐
│  Document   │       │     Media        │
├─────────────┤       ├──────────────────┤
│ id          │       │ id               │
│ title       │       │ cloudinaryId     │
│ description │       │ url              │
│ fileUrl     │       │ publicId         │
│ fileName    │       │ format           │
│ fileSize    │       │ width / height   │
│ mimeType    │       │ resourceType     │
│ cloudinaryId│       │ bytes            │
│ articleId?  │       │ createdAt        │
│ uploadedBy  │       └──────────────────┘
│ createdAt   │
└─────────────┘
```

### 7.2 Détail des entités

#### User

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID / CUID | Identifiant unique |
| `email` | String (unique) | Email de connexion |
| `name` | String | Nom affiché (auteur) |
| `passwordHash` | String | Mot de passe hashé (bcrypt) |
| `role` | Enum | `ADMIN` \| `CONTRIBUTEUR` |
| `isActive` | Boolean | Compte actif |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Dernière modification |

#### Article

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID / CUID | Identifiant unique |
| `title` | String | Titre de l'article |
| `slug` | String (unique) | Segment d'URL |
| `excerpt` | String (max 300) | Résumé / meta description |
| `content` | Text (HTML) | Corps de l'article |
| `coverImageUrl` | String | URL Cloudinary image couverture |
| `coverImagePublicId` | String | Public ID Cloudinary (pour transformations) |
| `status` | Enum | `DRAFT` \| `PUBLISHED` \| `ARCHIVED` |
| `publishedAt` | DateTime? | Date de publication effective |
| `authorId` | FK → User | Auteur |
| `createdAt` | DateTime | Création |
| `updatedAt` | DateTime | Modification |

**Index** : `slug` (unique), `status + publishedAt` (liste publique), `authorId`

#### Category

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID / CUID | Identifiant unique |
| `name` | String | Nom affiché |
| `slug` | String (unique) | Segment d'URL |
| `description` | String? | Description courte |
| `color` | String? | Couleur hex (badge) |
| `sortOrder` | Int | Ordre d'affichage |
| `createdAt` | DateTime | Création |

#### Document

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID / CUID | Identifiant unique |
| `title` | String | Titre du document |
| `description` | String? | Description |
| `fileUrl` | String | URL Cloudinary (raw) |
| `fileName` | String | Nom original du fichier |
| `fileSize` | Int | Taille en octets |
| `mimeType` | String | `application/pdf` |
| `cloudinaryPublicId` | String | Public ID Cloudinary |
| `articleId` | FK → Article? | Article associé (optionnel) |
| `uploadedById` | FK → User | Uploader |
| `isPublic` | Boolean | Visible dans la bibliothèque |
| `createdAt` | DateTime | Date d'upload |

#### Media (optionnel — journal des uploads)

Table de traçabilité pour tous les fichiers Cloudinary, facilitant le nettoyage et la gestion.

### 7.3 Énumérations

```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  CONTRIBUTEUR = 'CONTRIBUTEUR'
}

enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}
```

### 7.4 Règles métier

| Règle | Description |
|-------|-------------|
| R1 | Un article `PUBLISHED` doit avoir : titre, slug, excerpt, coverImage, content, ≥1 catégorie |
| R2 | Le slug est recalculé depuis le titre uniquement à la création (pas en modification) |
| R3 | Seuls les articles `PUBLISHED` avec `publishedAt ≤ now` sont visibles publiquement |
| R4 | Un contributeur ne peut modifier que ses propres brouillons ; un admin peut tout modifier |
| R5 | La suppression d'un article est un archivage (`ARCHIVED`), jamais un hard delete |
| R6 | Les PDF sont servis via URL Cloudinary signée ou publique selon configuration |
| R7 | Taille max upload : images 10 Mo, PDF 25 Mo |

---

## 8. Exigences non fonctionnelles

### 8.1 Performance

| Métrique | Cible |
|----------|-------|
| LCP (mobile 4G) | < 2,5 s |
| FCP | < 1,5 s |
| Taille page accueil | < 500 Ko (hors images) |
| Images | WebP/AVIF via Cloudinary, lazy loading |

### 8.2 Accessibilité

- HTML sémantique (landmarks, headings hiérarchiques)
- Alt text obligatoire sur les images (prompt à l'upload)
- Contraste WCAG 2.1 AA
- Navigation clavier fonctionnelle

### 8.3 SEO

- URLs propres et stables
- `sitemap.xml` dynamique
- `robots.txt`
- Balises `title` et `meta description` par page
- Données structurées JSON-LD (`Article`, `Organization`)
- Redirections 301 depuis anciennes URLs

### 8.4 Sécurité

- Mots de passe hashés (bcrypt, cost 12)
- Sessions httpOnly, secure en production
- CSRF protection sur les formulaires admin
- Validation et sanitization du HTML éditeur (DOMPurify)
- Rate limiting sur login et uploads
- Variables sensibles en environnement (jamais en repo)

### 8.5 Compatibilité navigateurs

- Chrome, Firefox, Safari, Edge (2 dernières versions)
- Safari iOS 15+ (cible WhatsApp mobile)
- Android Chrome 90+

---

## 9. Hors périmètre V1

Les éléments suivants sont explicitement **exclus** de la première version :

- Commentaires sur les articles
- Newsletter / emailing intégré
- Statistiques avancées (Google Analytics intégration simple possible)
- Publication programmée
- Version multilingue
- Application mobile native
- Espace membre lecteur (inscription public)
- Paiement / don intégré (lien externe HelloAsso conservé)

---

## 10. Critères d'acceptation globaux

- [ ] Un contributeur non technique peut publier un article avec image en moins de 5 minutes
- [ ] Un lien d'article partagé sur WhatsApp affiche titre + image + description
- [ ] Le site est pleinement utilisable sur un smartphone 375 px de large
- [ ] Les documents PDF sont téléchargeables depuis l'article et la page `/documents`
- [ ] Le design respecte la charte MEEED (couleurs, typo, logo)
- [ ] Le site est déployable sur Heroku via push GitHub
- [ ] Les anciennes URLs principales redirigent vers les nouvelles (301)

---

*Document rédigé pour validation avant démarrage du développement — Étape 1 de la roadmap.*
