# Cahier des charges — MEEED Magazine

| Élément | Détail |
|--------|--------|
| **Projet** | Site magazine / CMS éditorial de l’association MEEED |
| **Domaine cible** | `meeed.fr` |
| **Version du document** | 1.0 |
| **Date** | 27 juillet 2026 |
| **Objet** | Document contractuel décrivant le périmètre fonctionnel livré et les technologies / prestataires retenus |
| **Statut** | Base juridique de référence — inventaire des fonctionnalités **déjà présentes** |

---

## 1. Objet du présent document

Le présent cahier des charges a pour objet de :

1. Décrire le produit numérique **MEEED Magazine** livré à l’association MEEED ;
2. Retracer de manière exhaustive les **fonctionnalités déjà présentes** dans la solution ;
3. Identifier les **technologies** et **prestataires tiers** utilisés pour l’hébergement des données et des médias ;
4. Délimiter le **périmètre inclus** et le **périmètre exclu**, afin de servir de base de référence en cas de litige, de réception ou d’évolution ultérieure.

Toute fonctionnalité non listée dans le présent document est réputée **hors périmètre** de la livraison couverte par ce cahier des charges, sauf avenant écrit.

---

## 2. Contexte et présentation du produit

### 2.1 Maître d’ouvrage

**Association MEEED** (*Maraichage Efficient en Eau et en Energie Décarbonée*), association loi 1901 d’intérêt général.

Missions principales de l’association : développer et diffuser des solutions pour un maraîchage plus efficient en eau et en énergie ; informer et former ; mettre à disposition des dossiers et documents techniques réplicables.

### 2.2 Besoin couvert

Remplacer le site vitrine statique antérieur par un **magazine en ligne** permettant :

- la publication régulière d’actualités par plusieurs contributeurs ;
- le partage social optimisé (notamment WhatsApp, via métadonnées Open Graph) ;
- le dépôt et la diffusion de documents PDF ;
- l’administration du contenu sans compétences techniques avancées.

### 2.3 Produit livré

**MEEED Magazine** est un site web magazine / CMS éditorial, accessible au public et administrable via un back-office. Il ne constitue **ni un forum**, **ni un réseau social**, **ni une messagerie**.

Slogan produit : *Publier, partager.*

---

## 3. Parties prenantes et rôles utilisateurs

| Rôle | Description | Accès |
|------|-------------|--------|
| **Lecteur (public / anonyme)** | Maraîcher, agriculteur, partenaire, grand public | Front-office uniquement |
| **Contributeur** | Rédacteur interne ou externe autorisé | Back-office limité à ses contenus et à son profil |
| **Administrateur** | Responsable communication / direction | Back-office complet (utilisateurs, catégories, projets, tous les contenus) |

---

## 4. Architecture technique et prestataires

### 4.1 Stack applicative

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Framework web | **Next.js 15** (App Router) | Rendu serveur (SSR/RSC), routing, API |
| Langage | **TypeScript** / **React 19** | Développement typé |
| Styles | **Tailwind CSS 4** | Interface et charte graphique |
| ORM | **Prisma 6** | Modèle de données et migrations |
| Base de données | **PostgreSQL** | Stockage relationnel des contenus et comptes |
| Authentification | **NextAuth.js (Auth.js) v5** — provider Credentials | Sessions back-office (JWT, durée 7 jours) |
| Hachage mots de passe | **bcryptjs** (facteur de coût 12) | Sécurité des comptes |
| Éditeur de contenu | **TipTap** | Édition WYSIWYG des articles |
| Validation | **Zod** | Contrôle des formulaires et entrées |
| Sanitisation HTML | **isomorphic-dompurify** | Protection XSS du contenu éditeur |
| Runtime | **Node.js 20+** | Exécution serveur |

### 4.2 Prestataires tiers (sous-traitance technique)

Les services suivants sont des **prestataires externes** nécessaires au fonctionnement de la solution. Leur disponibilité, leurs conditions tarifaires et leurs engagements de service relèvent de leurs propres conditions contractuelles.

#### 4.2.1 Neon — base de données

| Élément | Détail |
|---------|--------|
| **Prestataire** | **Neon** ([neon.tech](https://neon.tech)) |
| **Service** | Hébergement **PostgreSQL** managé (cloud) |
| **Usage dans le projet** | Stockage de l’ensemble des données structurées : utilisateurs, articles, catégories, projets, métadonnées des documents |
| **Mode de connexion** | Chaîne de connexion standard PostgreSQL via la variable d’environnement `DATABASE_URL` |
| **Données stockées chez Neon** | Données textuelles et métadonnées uniquement (pas les fichiers binaires images/PDF) |

Le prestataire **Neon** est le fournisseur retenu pour l’hébergement de la base de données en production.

#### 4.2.2 Cloudinary — stockage des médias

| Élément | Détail |
|---------|--------|
| **Prestataire** | **Cloudinary** ([cloudinary.com](https://cloudinary.com)) |
| **Service** | Stockage, transformation et livraison de médias (CDN) |
| **Usage dans le projet** | Stockage des **photos / images** (couvertures d’articles et de projets, images inline dans le contenu) et des **documents PDF** |
| **Variables associées** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Limites applicatives** | Images : 10 Mo max ; PDF : 25 Mo max ; type PDF uniquement pour les documents |

Le prestataire **Cloudinary** est le fournisseur retenu pour le stockage et la diffusion des photos et fichiers PDF. La base de données (Neon) ne conserve que les métadonnées (URLs, identifiants publics, tailles, titres, etc.).

#### 4.2.3 Autres services tiers

| Prestataire / service | Usage | Nature |
|----------------------|--------|--------|
| **HelloAsso** | Redirection vers les formulaires de don de l’association | Lien externe uniquement — **aucun paiement intégré** dans l’application |
| Hébergeur applicatif (PaaS, ex. Heroku) | Exécution de l’application Next.js, domaine `meeed.fr` | Hébergement du code applicatif (distinct de Neon et Cloudinary) |

### 4.3 Schéma logique des flux

```
Navigateur (public / admin)
        │
        ▼
Application Next.js (hébergeur applicatif)
        │
        ├──► Neon (PostgreSQL)     → comptes, articles, catégories, projets, métadonnées
        └──► Cloudinary            → images / photos + PDF
```

### 4.4 Variables d’environnement contractuellement nécessaires

| Variable | Prestataire / usage |
|----------|---------------------|
| `DATABASE_URL` | Neon (PostgreSQL) |
| `NEXTAUTH_URL` | URL publique du site |
| `NEXTAUTH_SECRET` | Secret de session |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary |
| `CLOUDINARY_API_KEY` | Cloudinary |
| `CLOUDINARY_API_SECRET` | Cloudinary |

---

## 5. Modèle de données

Entités principales gérées par l’application (stockées chez **Neon**) :

| Entité | Description |
|--------|-------------|
| **User** | Compte back-office (`ADMIN` ou `CONTRIBUTEUR`), email, nom, mot de passe hashé, statut actif/inactif |
| **Article** | Contenu éditorial (titre, slug, extrait, HTML, image de couverture Cloudinary, statut `DRAFT` / `PUBLISHED` / `ARCHIVED`, date de publication, auteur) |
| **Category** | Thématique (nom, slug, description, couleur, ordre) |
| **ArticleCategory** | Liaison many-to-many articles ↔ catégories |
| **Project** | Projet association (titre, slug, résumé, description, cover Cloudinary, lien de don, actif, lié à une catégorie) |
| **Document** | Métadonnées d’un PDF hébergé sur Cloudinary (titre, description, URL, taille, public/privé, lien optionnel vers article et/ou projet) |

Les fichiers binaires (images, PDF) sont hébergés chez **Cloudinary** ; Neon ne stocke pas ces binaires.

---

## 6. Fonctionnalités livrées — Front-office (public)

Les fonctionnalités ci-dessous sont **déjà présentes** et accessibles sans authentification, sauf mention contraire.

### 6.1 Navigation et structure du site

| N° | Fonctionnalité | Description |
|----|----------------|-------------|
| F-01 | En-tête et menu | Navigation : Accueil, Articles, Projets, Documents, À propos, Contact, Faire un don |
| F-02 | Menu mobile | Navigation adaptée aux écrans mobiles |
| F-03 | Recherche (header) | Accès au formulaire de recherche vers `/recherche` |
| F-04 | Pied de page | Coordonnées de l’association, liens utiles, accès HelloAsso |
| F-05 | Pages d’erreur | Gestion des pages introuvables (404) et erreurs applicatives |

### 6.2 Contenu éditorial

| N° | Fonctionnalité | Description |
|----|----------------|-------------|
| F-06 | Page d’accueil magazine | Hero, présentation, carrousel d’actualités |
| F-07 | Liste des articles | Page `/actualites` avec pagination et filtres (recherche, catégorie, projet, auteur, dates, type) |
| F-08 | Page article | URL `/a/{slug}` : titre, métadonnées, image de couverture, contenu HTML, documents associés, articles similaires, partage |
| F-09 | Page catégorie | URL `/c/{slug}` : liste des articles de la catégorie |
| F-10 | Page projets | Vitrine des projets actifs, avec éventuel lien de don HelloAsso |
| F-11 | Bibliothèque de documents | Page `/documents` : liste des PDF publics, filtres (recherche, projet, catégorie, uploader, dates, liaison) |
| F-12 | Consultation / téléchargement PDF | Visualisation et téléchargement des documents publics via les routes API dédiées |
| F-13 | Recherche full-text | Page `/recherche?q=` sur titres, extraits et contenus d’articles |
| F-14 | Page À propos | Contenu institutionnel |
| F-15 | Page Contact | Formulaire de contact ouvrant un client mail (`mailto`) — **pas d’envoi d’e-mail serveur intégré** |
| F-16 | Page Don | Redirection vers HelloAsso |

### 6.3 Partage, SEO et migration

| N° | Fonctionnalité | Description |
|----|----------------|-------------|
| F-17 | Barre de partage | Partage WhatsApp + copie du lien (comportement sticky sur mobile) |
| F-18 | Métadonnées Open Graph / Twitter | Titre, description et image de couverture optimisés pour le partage (notamment WhatsApp) |
| F-19 | Données structurées JSON-LD | Balises Organization, Article, fil d’Ariane |
| F-20 | Sitemap XML dynamique | Indexation des pages et articles publiés |
| F-21 | robots.txt | Autorisation du front-office ; exclusion de `/admin` et `/api` |
| F-22 | Redirections 301 | Conservation des anciennes URLs Infomaniak (`/a-propos-de`, `/nos-projets`, `/contactez-nous`, `/tracteur-retrofit`, `/arrosage-etp`, etc.) |

---

## 7. Fonctionnalités livrées — Authentification et profil

| N° | Fonctionnalité | Qui | Description |
|----|----------------|-----|-------------|
| F-23 | Connexion | Public → membre | Email + mot de passe (`/admin/login`) |
| F-24 | Inscription contributeur | Public | Création d’un compte au rôle `CONTRIBUTEUR` depuis l’écran de connexion |
| F-25 | Déconnexion | Membre | Fin de session |
| F-26 | Protection des routes | Système | Accès `/admin/*` et `/api/upload/*` réservé aux utilisateurs authentifiés |
| F-27 | Restriction admin | Système | Pages utilisateurs, catégories et projets réservées au rôle `ADMIN` |
| F-28 | Mon profil | Membre | Modification du nom affiché |
| F-29 | Changement de mot de passe | Membre | Avec vérification de l’ancien mot de passe |
| F-30 | Guide contributeur | Membre | Aide pas-à-pas (`/admin/aide`) |

---

## 8. Fonctionnalités livrées — Back-office éditorial

### 8.1 Tableau de bord et articles

| N° | Fonctionnalité | Qui | Description |
|----|----------------|-----|-------------|
| F-31 | Dashboard | Membre | Vue d’ensemble (compteurs publiés / brouillons / archivés / documents) |
| F-32 | Liste des articles | Membre | Le contributeur ne voit que **ses** articles ; l’admin voit **tous** les articles |
| F-33 | Création / édition d’article | Membre | Formulaire : titre, slug, catégories, extrait, couverture, contenu TipTap, statut |
| F-34 | Éditeur riche TipTap | Membre | Titres H2/H3, gras, italique, listes, liens, images inline (upload Cloudinary) |
| F-35 | Enregistrer en brouillon | Membre | Sauvegarde sans publication |
| F-36 | Publier | Membre | Mise en ligne immédiate (sous réserve des champs obligatoires) |
| F-37 | Archiver / republier | Auteur ou Admin | Retrait puis remise en ligne |
| F-38 | Suppression définitive | Auteur ou Admin | Uniquement pour un article déjà au statut `ARCHIVED` |
| F-39 | Aperçu public | Membre | Lien vers le rendu front-office |

### 8.2 Documents et médias (Cloudinary)

| N° | Fonctionnalité | Qui | Description |
|----|----------------|-----|-------------|
| F-40 | Upload d’images | Membre | Couverture et images inline via upload signé vers **Cloudinary** (max 10 Mo) |
| F-41 | Upload de PDF | Membre | Stockage **Cloudinary** en ressource `raw` (max 25 Mo) |
| F-42 | Gestion des documents | Membre | Création, métadonnées, visibilité public/privé, liaison article et/ou projet, suppression (propriétaire ou admin) |
| F-43 | Suppression d’image Cloudinary | Membre | Action dédiée de nettoyage côté Cloudinary |
| F-44 | Page de test upload | Membre | Outil technique `/admin/upload-test` |

### 8.3 Administration (rôle ADMIN uniquement)

| N° | Fonctionnalité | Description |
|----|----------------|-------------|
| F-45 | CRUD catégories | Nom, slug, description, couleur, ordre ; garde-fous en cas d’articles publiés liés |
| F-46 | CRUD projets | Titre, slug, résumé, description, cover Cloudinary, couleur, ordre, actif, URL de don, lien 1:1 avec une catégorie |
| F-47 | Gestion des utilisateurs | Liste, filtres, création, changement de rôle, activation/désactivation, réinitialisation de mot de passe |

### 8.4 Exploitation technique

| N° | Fonctionnalité | Description |
|----|----------------|-------------|
| F-48 | Health check | Endpoint `/api/health` vérifiant la disponibilité de la base (**Neon**/PostgreSQL) et de **Cloudinary** |
| F-49 | En-têtes de sécurité | Headers HTTP (X-Frame-Options, nosniff, referrer-policy, permissions-policy) |

---

## 9. Matrice des droits

| Capacité | Anonyme | Contributeur | Administrateur |
|----------|---------|--------------|----------------|
| Consulter le site et les PDF publics | Oui | Oui | Oui |
| S’inscrire / se connecter | Oui | — | — |
| Dashboard, articles (siens), documents (siens), profil, aide | Non | Oui | Oui |
| Modifier / archiver / supprimer les contenus d’autrui | Non | Non | Oui |
| Voir tous les articles et documents en admin | Non | Non | Oui |
| Gérer catégories, projets, utilisateurs | Non | Non | Oui |
| Uploader images / PDF (Cloudinary) | Non | Oui | Oui |
| Accéder aux documents privés | Non | Propriétaire | Oui |

---

## 10. Exigences non fonctionnelles couvertes

| Domaine | Engagement / mise en œuvre |
|---------|----------------------------|
| **Performance mobile** | Conception mobile-first ; images optimisées via Cloudinary (formats modernes, redimensionnement) |
| **SEO** | URLs stables, métadonnées, sitemap, robots.txt, JSON-LD, redirections 301 |
| **Sécurité** | Mots de passe hashés, sessions sécurisées, sanitisation HTML, validation Zod, secrets hors code source |
| **Accessibilité** | HTML sémantique, hiérarchie de titres, contrastes selon charte |
| **Compatibilité** | Navigateurs modernes (Chrome, Firefox, Safari, Edge) et Safari iOS (cible partage WhatsApp) |
| **Identité visuelle** | Charte MEEED (couleurs primaire `#292f36`, accent `#4ecdc4`, etc.) |

---

## 11. Périmètre exclu (hors livraison couverte)

Sont **explicitement exclus** du présent cahier des charges (sauf avenant) :

- Forum de discussion, sujets, réponses, modération communautaire ;
- Messagerie privée entre utilisateurs ;
- Commentaires, likes ou réactions sur les articles ;
- Newsletter / emailing intégré ;
- Analytics avancés (Google Analytics, etc.) ;
- Publication programmée dans le futur ;
- Version multilingue ;
- Application mobile native ou PWA hors-ligne ;
- Espace membre « lecteur » distinct du back-office contributeur ;
- Paiement / don intégré (seul un lien externe HelloAsso est prévu) ;
- Galerie photos sociale ou albums membres ;
- Vidéo native hébergée ;
- Statistiques de lecture détaillées ;
- Export PDF d’un article.

Toute évolution (notamment un éventuel module forum) fera l’objet d’un **avenant** ou d’un nouveau cahier des charges dédié.

---

## 12. Critères de réception

La livraison est réputée conforme lorsque les points suivants sont vérifiés :

1. Un contributeur peut publier un article avec image de couverture (Cloudinary) et le rendre visible sur le front-office ;
2. Un lien d’article partagé (WhatsApp / débogueur Open Graph) affiche titre, image et description ;
3. Les documents PDF publics sont listés sur `/documents` et téléchargeables ;
4. La base de données PostgreSQL est opérationnelle via le prestataire **Neon** (`DATABASE_URL`) ;
5. Les images et PDF sont stockés et servis via le prestataire **Cloudinary** ;
6. Les rôles Contributeur et Administrateur respectent la matrice des droits (§9) ;
7. Le site est utilisable sur smartphone (largeur indicative 375 px) ;
8. Les redirections 301 des anciennes URLs principales fonctionnent ;
9. L’endpoint `/api/health` confirme l’état de la base et de Cloudinary.

---

## 13. Propriété, données et responsabilités prestataires

### 13.1 Données

- Les **données structurées** (contenus éditoriaux, comptes, métadonnées) sont hébergées chez **Neon**.
- Les **fichiers médias** (photos, PDF) sont hébergés chez **Cloudinary**.
- Le maître d’ouvrage demeure propriétaire des contenus qu’il publie.
- Les conditions d’usage, de conservation, de facturation et de disponibilité de Neon et Cloudinary relèvent des contrats souscrits auprès de ces prestataires.

### 13.2 Disponibilité

La disponibilité globale du service dépend de la disponibilité cumulative de : (a) l’hébergeur applicatif, (b) **Neon**, (c) **Cloudinary**. Une interruption chez l’un de ces prestataires peut affecter tout ou partie du site (affichage, publication, médias).

### 13.3 Évolutions

Toute demande hors périmètre (§11) ou toute modification substantielle des prestataires (remplacement de Neon ou de Cloudinary) nécessite un accord écrit et, le cas échéant, un avenant au présent cahier des charges.

---

## 14. Synthèse contractuelle

| Rubrique | Contenu retenu |
|----------|----------------|
| **Produit** | Site magazine / CMS MEEED Magazine |
| **Fonctionnalités** | F-01 à F-49 telles que décrites aux §§6 à 8 |
| **Base de données** | PostgreSQL chez le prestataire **Neon** |
| **Stockage photos / PDF** | Prestataire **Cloudinary** |
| **Auth** | NextAuth (email / mot de passe), rôles ADMIN et CONTRIBUTEUR |
| **Dons** | Lien externe HelloAsso uniquement |
| **Hors scope** | Forum, messagerie, commentaires, newsletter, paiement intégré, etc. (§11) |

---

## 15. Validation

Le présent document constitue la **référence fonctionnelle et technique** de la livraison. Sa signature (ou validation écrite) par le maître d’ouvrage vaut acceptation du périmètre décrit.

| Partie | Nom | Date | Signature |
|--------|-----|------|-----------|
| Association MEEED (maître d’ouvrage) | | | |
| Prestataire / développeur | | | |

---

*Document unique — Cahier des charges MEEED Magazine — Version 1.0 — 27 juillet 2026*
