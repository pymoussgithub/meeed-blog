# Playbook agent — Implémentation du Forum MEEED

> **Usage** : ce fichier est l’instruction unique pour un agent Cursor Auto.  
> **Source de vérité** : `Cahier des charges blog & forum.pdf` (v1.4 — 27 juillet 2026).  
> **Objectif** : livrer le module **Forum complet** (FB-01 → FB-18), sans toucher au Magazine déjà livré sauf intégrations croisées listées ici.

---

## 0. Contexte pour l’agent

### 0.1 État du projet

| Brique | Statut | Action |
|--------|--------|--------|
| Magazine (Blog) F-01 → F-47 | **Déjà livré** dans ce repo | Ne pas réécrire. Modifier uniquement pour le lien article ↔ forum (FB-09→FB-12) et le menu. |
| Forum FB-01 → FB-18 | **Absent** (aucune table / route `/forum`) | À développer intégralement. |

### 0.2 Stack à respecter (déjà en place)

- Next.js 15 App Router, TypeScript, React 19, Tailwind CSS 4
- Prisma 6 + PostgreSQL (Neon)
- Auth.js / NextAuth v5 — rôles `ADMIN` | `CONTRIBUTEUR` uniquement
- Server Actions + couche `src/lib/services/*` + Zod + `sanitizeHtml`
- Design tokens : `primary`, `accent`, polices Chivo / Roboto (`src/app/globals.css`)

### 0.3 Décisions contractuelles (non négociables)

1. **Qui publie** : seuls `CONTRIBUTEUR` et `ADMIN` connectés créent sujets / réponses. Pas de rôle « Membre forum ». Les anonymes consultent uniquement.
2. **Qui modère** : uniquement `ADMIN`. Pas de rôle Modérateur distinct.
3. **Notifications e-mail (FB-16)** : e-mail quand un sujet que l’utilisateur a **créé** ou auquel il a **répondu** reçoit une **nouvelle réponse**. Pas de bouton « s’abonner ».
4. **Recherche (FB-17)** : full-text sur sujets **et** messages du forum.
5. **Lien articles** : un article peut être relié à **plusieurs** discussions.

### 0.4 Hors périmètre — ne pas coder

- Abonnement explicite indépendant de la participation
- Profils publics, likes, badges, réactions
- Réponses imbriquées / threads structurés
- Signalement utilisateur, journal d’audit de modération
- Messagerie privée, pièces jointes dans les messages
- Newsletter, paiement intégré, multilingue, app mobile
- Nouveau type de compte « Membre forum »

### 0.5 Conventions de code (miroirs du Magazine)

Suivre strictement les patterns existants :

| Couche | Emplacement / pattern |
|--------|------------------------|
| Modèles | `prisma/schema.prisma` + migration |
| Services | `src/lib/services/*.service.ts` |
| Validations | `src/lib/validations/*.ts` (Zod) |
| Mutations | `src/actions/*.actions.ts` → `ActionResult` (`actionSuccess` / `actionError`) |
| Auth | `requireAuth()` / `requireAdmin()` dans `src/lib/auth-helpers.ts` |
| HTML | toujours `sanitizeHtml()` avant persistance |
| UI | réutiliser `Button`, `Input`, `Textarea`, `Pagination`, `Badge`, tokens Tailwind |
| Routes publiques | `src/app/(public)/…` |
| Routes admin | `src/app/admin/(protected)/…` |
| Résultat actions | jamais throw non catché vers le client ; retourner `ActionResult` |

Après chaque étape : `npx tsc --noEmit` (ou build) doit passer ; ne pas laisser de code mort.

### 0.6 Mode d’exécution recommandé

1. Lire cette section 0 + l’étape en cours uniquement.
2. Implémenter **une étape complète** (code + critères d’acceptation).
3. Cocher les cases de l’étape.
4. Passer à l’étape suivante **sans** anticiper les suivantes (sauf schéma déjà prévu à l’étape 1).
5. En fin de parcours, valider la checklist § « Réception finale ».

---

## 1. Modèle de données cible (à créer à l’étape 1)

Proposition alignée sur le CDC (adapter les noms si besoin, mais garder les concepts) :

```prisma
enum ForumTopicStatus {
  OPEN       // ouvert, on peut répondre
  LOCKED     // verrouillé : lecture seule
  ARCHIVED   // archivé : hors listes principales, lecture seule
}

model ForumCategory { // rubrique
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  topics      ForumTopic[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ForumTopic { // sujet
  id           String           @id @default(cuid())
  title        String
  slug         String           @unique
  status       ForumTopicStatus @default(OPEN)
  isPinned     Boolean          @default(false)  // épinglage / mettre en avant
  isHidden     Boolean          @default(false)  // masqué (modération)
  deletedAt    DateTime?        // suppression logique
  categoryId   String
  category     ForumCategory    @relation(...)
  authorId     String
  author       User             @relation(...)
  posts        ForumPost[]
  articles     ArticleForumTopic[] // N articles ↔ N sujets
  lastPostAt   DateTime?
  postsCount   Int              @default(0)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([categoryId, isPinned, lastPostAt])
  @@index([status, lastPostAt])
}

model ForumPost { // message / réponse (le 1er = corps du sujet)
  id        String    @id @default(cuid())
  body      String    @db.Text
  isHidden  Boolean   @default(false)
  deletedAt DateTime?
  topicId   String
  topic     ForumTopic @relation(...)
  authorId  String
  author    User       @relation(...)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([topicId, createdAt])
}

model ArticleForumTopic {
  articleId String
  topicId   String
  article   Article    @relation(...)
  topic     ForumTopic @relation(...)
  createdAt DateTime   @default(now())

  @@id([articleId, topicId])
}
```

**Recherche full-text (FB-17)** : sur PostgreSQL, préférer `tsvector` généré (colonnes / index GIN) sur `ForumTopic.title` + `ForumPost.body`, ou requête `to_tsvector` / `plainto_tsquery` documentée dans le service. Pas de dépendance externe type Algolia.

**URLs publiques cibles** :

| Page | URL |
|------|-----|
| Accueil forum | `/forum` |
| Rubrique | `/forum/r/{slug}` |
| Sujet | `/forum/s/{slug}` |
| Récents | `/forum/recents` |
| Importants (épinglés) | `/forum/importants` |
| Liés à un article | `/forum/article/{articleSlug}` |
| Recherche | `/forum/recherche?q=` |
| Admin rubriques | `/admin/forum/rubriques` |
| Admin modération | `/admin/forum` |

---

## Étape 1 — Schéma Prisma, relations User/Article, seed

**Codes** : fondation pour FB-01 → FB-18

### À faire

- [x] Étendre `prisma/schema.prisma` avec les modèles ci-dessus + relations inverses sur `User` et `Article`
- [x] Créer une migration Prisma (`npm run db:migrate` en local)
- [x] Seed : 2–3 rubriques d’exemple (`Discussions générales`, `Domaines`, `Questions`)
- [x] Documenter toute nouvelle variable d’env dans `.env.example` (ex. SMTP pour l’étape 8)

### Critères d’acceptation

- [x] `prisma generate` OK
- [x] Tables créées en base
- [x] Aucune régression sur le Magazine (articles, auth, documents)

---

## Étape 2 — Couche métier, validations, permissions (FB-15, FB-18 partiel)

**Codes** : FB-15, FB-18 (règles)

### À faire

- [x] `src/lib/validations/forum.ts` — Zod : titre, body, slug, ids
- [x] `src/lib/services/forum-category.service.ts` — CRUD rubriques (admin)
- [x] `src/lib/services/forum-topic.service.ts` — listes, détail, création, états
- [x] `src/lib/services/forum-post.service.ts` — messages, édition, soft-delete / hide
- [x] Helpers droits :
  - lecture publique : sujets non `deletedAt`, non `isHidden` (sauf admin)
  - écrire : `requireAuth()` (CONTRIBUTEUR | ADMIN)
  - modérer / gérer rubriques : `requireAdmin()`
  - édition message : auteur **ou** ADMIN ; règles enrichies (champs obligatoires, sanitisation)
- [x] Sanitiser tout `body` HTML/texte via `sanitizeHtml` (si TipTap) ou échapper le texte brut de façon cohérente avec le rendu

### Critères d’acceptation

- [x] Un anonyme ne peut pas appeler une action de création
- [x] Un CONTRIBUTEUR ne peut pas appeler une action de modération
- [x] Un ADMIN peut tout modérer

---

## Étape 3 — Navigation & pages publiques structure (FB-01, FB-02, FB-07, FB-08)

**Codes** : FB-01, FB-02, FB-07, FB-08

### À faire

- [x] Ajouter « Forum » dans `src/lib/navigation.ts` (`NAV_LINKS`)
- [x] Page `/forum` : rubriques (ordre `sortOrder`), sujets récents, liens vues complémentaires
- [x] Page `/forum/r/[slug]` : liste des sujets de la rubrique, pagination, tris (activité récente, création, réponses, épinglés d’abord)
- [x] Fil d’Ariane Forum → Rubrique → Sujet
- [x] URLs stables + `Pagination` existante
- [x] Responsive mobile (même shell `(public)/layout`)

### Critères d’acceptation

- [x] Accueil forum utilisable sans être connecté
- [x] Rubriques ordonnées comme en admin
- [x] Pagination et query `?page=` / `?sort=` propres

---

## Étape 4 — Création sujets & réponses (FB-03, FB-18)

**Codes** : FB-03, FB-18

### À faire

- [x] `src/actions/forum.actions.ts` : `createTopic`, `createReply`, `updateTopic`, `updatePost`
- [x] Formulaire nouveau sujet (rubrique, titre, message initial) — réservé connectés
- [x] Formulaire réponse en bas de sujet — désactivé si `LOCKED` / `ARCHIVED`
- [x] Page `/forum/s/[slug]` : titre, métadonnées, article(s) liés (placeholder OK), messages chronologiques, pagination
- [x] CTA « Se connecter » pour anonymes (`/admin/login?callbackUrl=…`)
- [x] Mise à jour `postsCount` / `lastPostAt` à chaque réponse
- [x] Confort « forum complet » : validation claire, états de chargement, messages d’erreur `ActionResult`

### Critères d’acceptation

- [x] CONTRIBUTEUR / ADMIN peut créer un sujet et une réponse visibles en front
- [x] Anonyme : lecture OK, écriture impossible
- [x] Sujet verrouillé : pas de nouvelle réponse

---

## Étape 5 — Épinglage, verrouillage, archivage, vues (FB-04, FB-05, FB-06)

**Codes** : FB-04, FB-05, FB-06

### À faire

- [x] Actions admin (ou depuis modération) : pin/unpin, lock/unlock, archive/restore
- [x] Listes : épinglés en tête
- [x] Vues :
  - `/forum/recents` — activité récente
  - `/forum/importants` — épinglés / mis en avant
  - `/forum/article/[articleSlug]` — discussions liées à un article publié
- [x] Sujets archivés exclus des listes principales ; accessibles via URL directe (lecture seule)

### Critères d’acceptation

- [x] Épinglage visible sur l’accueil et dans la rubrique
- [x] Verrouillage empêche les réponses
- [x] Les trois vues complémentaires fonctionnent

---

## Étape 6 — Lien Magazine ↔ Forum (FB-09 → FB-12)

**Codes** : FB-09, FB-10, FB-11, FB-12

### À faire

- [x] Table / service d’association `ArticleForumTopic`
- [x] **FB-10** : sur `src/app/(public)/a/[slug]/page.tsx`, section « Discussions associées » (liste de liens `/forum/s/…`)
- [x] **FB-11** : sur la page sujet, bloc « Article de référence » (carte / lien vers `/a/{slug}`) — plusieurs articles possibles
- [x] **FB-12** : dans l’espace éditorial (fiche article admin et/ou panneau dédié) :
  - associer une discussion existante
  - créer une discussion pré-liée à l’article
- [x] Droits : association gérée par ADMIN et par l’auteur CONTRIBUTEUR sur **ses** articles

### Critères d’acceptation

- [x] Un article peut lister N discussions
- [x] Un sujet affiche clairement le(s) article(s) lié(s)
- [x] Association possible depuis l’admin éditorial sans passer par SQL

---

## Étape 7 — Administration & modération (FB-02 admin, FB-13, FB-14)

**Codes** : FB-02 (ordre rubriques), FB-13, FB-14, FB-15

### À faire

- [x] Sidebar admin : entrées « Forum » + « Rubriques forum » (`adminOnly` pour rubriques et modération)
- [x] `/admin/forum/rubriques` : CRUD nom, slug, description, `sortOrder`, actif
- [x] `/admin/forum` : tableau de modération (sujets / messages récents, filtres statut)
- [x] Actions FB-14 :
  - masquer (`isHidden`)
  - supprimer logiquement (`deletedAt`)
  - verrouiller / déverrouiller
  - mettre en avant (pin)
  - déplacer un sujet (changer `categoryId`)
- [x] Contenu masqué / soft-deleted invisible au public ; visible et actionnable pour ADMIN

### Critères d’acceptation

- [x] CONTRIBUTEUR n’accède pas aux pages `/admin/forum*`
- [x] Toutes les actions FB-14 disponibles et persistées
- [x] Déplacement de sujet change la rubrique en front

---

## Étape 8 — Notifications e-mail (FB-16)

**Codes** : FB-16

### À faire

- [x] Choisir un envoi transactionnel simple (ex. Nodemailer SMTP, Resend, ou API compatible) — documenter les clés dans `.env.example`
- [x] Sur `createReply` : déterminer les destinataires =
  - auteur du sujet
  - auteurs des réponses précédentes
  - **exclure** l’auteur de la nouvelle réponse
  - dédoublonner les e-mails
- [x] Ne pas notifier pour messages masqués / soft-deleted
- [x] Contenu mail : titre du sujet, extrait, lien absolu vers `/forum/s/{slug}`
- [x] Échec d’envoi : logger, **ne pas** faire échouer la publication de la réponse
- [x] Pas de bouton « s’abonner » (hors scope)

### Critères d’acceptation

- [x] Nouvelle réponse → e-mail aux participants antérieurs
- [x] L’auteur de la réponse ne reçoit pas son propre mail
- [x] Publication OK même si SMTP down

---

## Étape 9 — Recherche full-text (FB-17)

**Codes** : FB-17

### À faire

- [x] Index / requête PostgreSQL full-text (français si possible : `to_tsvector('french', …)`)
- [x] Page `/forum/recherche?q=` + champ recherche sur l’accueil forum
- [x] Résultats : sujets et messages pertinents, lien vers le sujet (ancre message si possible)
- [x] Exclure contenus `isHidden` / `deletedAt` pour le public
- [x] Pagination des résultats

### Critères d’acceptation

- [x] Une requête sur un mot du titre ou du corps retourne le bon sujet/message
- [x] Pas de résultats pour contenus modérés hors vue admin

---

## Étape 10 — SEO léger, sitemap, polish, réception

### À faire

- [x] `generateMetadata` sur pages forum (titre, description)
- [x] Inclure URLs forum publiques pertinentes dans `src/app/sitemap.ts` (pas l’admin)
- [x] Vérifier `robots.txt` : front OK, `/admin` exclu
- [x] Parcours mobile : lecture, création, réponse, recherche
- [x] Lien Forum visible header + menu mobile + footer si pertinent
- [x] Mettre à jour brièvement `README.md` (section Forum + variables SMTP)

### Critères d’acceptation — alignés CDC §7.2

- [x] CONTRIBUTEUR / ADMIN connecté crée un sujet et une réponse visibles en front
- [x] E-mail de notification envoyé quand un sujet suivi (participation) évolue
- [x] Recherche full-text retourne sujets et messages pertinents
- [x] ADMIN modère ; CONTRIBUTEUR n’a pas les droits de modération
- [x] Forum utilisable sur smartphone, cohérent avec le Magazine

---

## Matrice des droits (rappel opérationnel)

| Capacité | Anonyme | Contributeur | Admin |
|----------|---------|--------------|-------|
| Consulter forum | Oui | Oui | Oui |
| Créer sujet / réponse | Non | Oui | Oui |
| Éditer son message | Non | Oui (les siens) | Oui (tous) |
| Modérer (masquer, soft-delete, lock, pin, déplacer) | Non | Non | Oui |
| Gérer rubriques | Non | Non | Oui |
| Associer article ↔ discussions | Non | Non* | Oui |

\*Sauf si explicitement étendu à l’auteur sur ses articles ; par défaut : Admin.

---

## Ordre de dépendance (ne pas inverser)

```
1 Schéma → 2 Services/droits → 3 Pages structure
                ↓
         4 Écriture sujets/réponses
                ↓
         5 États + vues → 6 Lien articles → 7 Admin modération
                ↓
         8 E-mails → 9 Recherche → 10 SEO / réception
```

---

## Fichiers attendus (indicatif)

```
prisma/schema.prisma                          # + migration
prisma/seed.ts                                # rubriques forum
src/lib/validations/forum.ts
src/lib/services/forum-category.service.ts
src/lib/services/forum-topic.service.ts
src/lib/services/forum-post.service.ts
src/lib/services/forum-search.service.ts
src/lib/mail.ts                               # envoi transactionnel
src/actions/forum.actions.ts
src/actions/forum-moderation.actions.ts
src/components/forum/…                        # listes, fil Ariane, forms, cards
src/app/(public)/forum/page.tsx
src/app/(public)/forum/r/[slug]/page.tsx
src/app/(public)/forum/s/[slug]/page.tsx
src/app/(public)/forum/recents/page.tsx
src/app/(public)/forum/importants/page.tsx
src/app/(public)/forum/article/[articleSlug]/page.tsx
src/app/(public)/forum/recherche/page.tsx
src/app/admin/(protected)/forum/page.tsx
src/app/admin/(protected)/forum/rubriques/page.tsx
```

Modifications ciblées existantes :

- `src/lib/navigation.ts`
- `src/components/layout/AdminSidebar.tsx`
- `src/app/(public)/a/[slug]/page.tsx`
- `src/components/admin/ArticleForm.tsx` (ou voisin) pour FB-12
- `src/app/sitemap.ts`
- `.env.example`

---

## Checklist catalogue FB (cocher en fin de livraison)

| Code | Fonctionnalité | Étape | Fait |
|------|----------------|-------|------|
| FB-01 | Accueil forum enrichi | 3 | [x] |
| FB-02 | Rubriques multiples + ordre admin | 3 + 7 | [x] |
| FB-03 | Création sujets et réponses | 4 | [x] |
| FB-04 | Épinglage | 5 | [x] |
| FB-05 | Verrouillage / archivage | 5 | [x] |
| FB-06 | Vues complémentaires | 5 | [x] |
| FB-07 | Pagination et URLs propres | 3 | [x] |
| FB-08 | Fil d’Ariane et tris | 3 | [x] |
| FB-09 | Article ↔ plusieurs discussions | 6 | [x] |
| FB-10 | Affichage discussions sur l’article | 6 | [x] |
| FB-11 | Affichage article dans le sujet | 6 | [x] |
| FB-12 | Association depuis l’éditorial | 6 | [x] |
| FB-13 | Tableau de modération admin | 7 | [x] |
| FB-14 | Actions de modération étendues | 7 | [x] |
| FB-15 | Permissions forum | 2 + 7 | [x] |
| FB-16 | Notifications e-mail | 8 | [x] |
| FB-17 | Recherche full-text | 9 | [x] |
| FB-18 | Édition enrichie + sanitisation | 2 + 4 | [x] |

---

## Prompt de démarrage suggéré pour Cursor Auto

```
Lis et suis strictement docs/agent-forum-etapes.md.
Le Magazine (F-01–F-47) est déjà livré : ne le réécris pas.
Implémente le Forum complet étape par étape en commençant à l’Étape 1.
Après chaque étape, vérifie ses critères d’acceptation puis enchaîne.
Respecte la matrice des droits et le hors-périmètre (§0.3–0.4).
```
