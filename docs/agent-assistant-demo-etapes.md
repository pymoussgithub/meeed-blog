# Playbook agent — Assistant de démonstration interactive MEEED

> **Usage** : ce fichier est l’instruction unique pour un agent Cursor Auto.  
> **Source de vérité produit** : [`docs/tutoriel-interactif-demo.md`](./tutoriel-interactif-demo.md) (conception des parcours, messages, validations).  
> **Objectif** : livrer l’**assistant interactif de démo** (panneau + spotlight + hub de sujets + chaîne présentation), sans réécrire le Magazine ni le Forum déjà livrés — uniquement instrumentation UI (`data-tour-id`) et nouvelle brique `tour`.

---

## 0. Contexte pour l’agent

### 0.1 État du projet

| Brique | Statut | Action |
|--------|--------|--------|
| Magazine (Blog) | **Déjà livré** | Ne pas réécrire. Ajouter seulement `data-tour-id` et hooks légers. |
| Forum | **Déjà livré** | Idem : instrumentation + éventuellement raccourcis contexte. |
| Assistant démo | **Absent** | À développer intégralement (ce playbook). |

### 0.2 Stack à respecter (déjà en place)

- Next.js 15 App Router, TypeScript, React 19, Tailwind CSS 4
- Auth.js / NextAuth v5 — rôles `ADMIN` | `CONTRIBUTEUR` uniquement
- Design tokens : `primary`, `accent`, polices Chivo / Roboto (`src/app/globals.css`)
- UI existante : `Button`, `Modal`, `Toast`, layouts public + admin
- Composant démo déjà présent : `src/components/dev/DevAccountSwitcher.tsx` (ne pas le casser ; s’en inspirer pour le flag env)

### 0.3 Décisions contractuelles (non négociables)

1. **Source des parcours** : les messages, cibles, validations et IDs de boutons viennent de `docs/tutoriel-interactif-demo.md`. Ne pas inventer de sujets hors catalogue §2 de ce doc.
2. **Ciblage UI** : chaque étape pointe un `data-tour-id` stable (convention §0.7). Pas de sélecteurs CSS fragiles (`nth-child`, classes Tailwind générées).
3. **Activation** : l’assistant est derrière un flag env (ex. `NEXT_PUBLIC_DEMO_TOUR=1`) ou un mode démo documenté dans `.env.example`. Désactivé par défaut en production.
4. **Pas de backend dédié** pour le moteur de parcours : état client (`localStorage` + contexte React). Les actions métier restent celles du site (Server Actions existantes).
5. **Accessibilité** : overlays non bloquants pour le clavier hors cible ; bouton « Quitter » toujours accessible ; respecter `prefers-reduced-motion` pour le spotlight.
6. **i18n** : textes FR uniquement (comme le reste du site).

### 0.4 Hors périmètre — ne pas coder

- Analytics / tracking utilisateur du tutoriel
- Éditeur WYSIWYG des parcours dans l’admin
- Traductions
- Refonte visuelle du site pour « mieux coller » au tutoriel
- Nouveaux parcours hors `tutoriel-interactif-demo.md`
- Remplacement de `DevAccountSwitcher` (complémentaire, pas concurrent)
- Tests E2E Playwright/Cypress complets de tous les parcours (smoke manuelle suffit à la réception)

### 0.5 Conventions de code

| Couche | Emplacement / pattern |
|--------|------------------------|
| Types + catalogue | `src/lib/tour/*.ts` |
| État / moteur | `src/components/tour/` (Provider client) |
| UI panneau + spotlight | `src/components/tour/` |
| Montage global | layouts `src/app/(public)/layout.tsx` et `src/app/admin/(protected)/layout.tsx` (ou provider commun) |
| Instrumentation | attribut `data-tour-id="…"` sur composants existants |
| Flag | `NEXT_PUBLIC_DEMO_TOUR` dans `.env.example` |

Après chaque étape : `npx tsc --noEmit` (ou lint ciblé) doit passer ; pas de code mort.

### 0.6 Mode d’exécution recommandé

1. Lire cette section 0 + **l’étape en cours uniquement**.
2. Pour le contenu des étapes UI (messages, validations), ouvrir la section correspondante de `docs/tutoriel-interactif-demo.md` — ne pas recopier tout le doc dans le code comments.
3. Implémenter **une étape complète** (code + critères d’acceptation).
4. Cocher les cases de l’étape dans ce fichier.
5. Passer à l’étape suivante **sans** anticiper (sauf types/catalogue déjà prévus à l’étape 1–2).
6. En fin de parcours, valider la checklist « Réception finale ».

### 0.7 Convention `data-tour-id`

Format : `{projet}.{zone}.{élément}` en kebab-case segments :

```
nav.header.articles
nav.header.forum
home.hero
home.news-carousel
articles.list.card
articles.filters.toggle
article.header
article.body
article.share.copy-link
article.linked-topics
documents.toolbar
documents.view
documents.download
forum.categories.table
forum.topic.reply-gate
forum.search.input
auth.login.email
auth.login.submit
admin.sidebar.articles
admin.articles.new-button
article.form.title
article.form.categories
article.form.excerpt
article.form.cover
article.form.body
article.form.publish
article.form.save-draft
article.form.forum-links
admin.dashboard.stats
admin.documents.upload
forum.reply.submit
forum.topic.subscribe
```

Si un ID manque dans la liste : le dériver du même schéma et le documenter dans `src/lib/tour/targets.ts`.

### 0.8 Types cibles (référence)

Alignés sur §9 de `tutoriel-interactif-demo.md` :

```ts
type TourAudience = "VISITOR" | "CONTRIBUTEUR" | "ADMIN";

type TourStepAction = "click" | "input" | "navigate" | "confirm" | "success";

type TourStep = {
  id: string;
  message: string;
  target: string; // data-tour-id
  action: TourStepAction;
  routeHint?: string;
  optional?: boolean;
  fallbackMessage?: string;
  fillDemo?: Record<string, string>; // pour « Remplir pour moi »
};

type TourSubject = {
  id: string; // ex. pub-accueil, contrib-publier-article
  label: string;
  description: string;
  audience: TourAudience[];
  steps: TourStep[];
  nextSuggested?: string[];
};
```

---

## 1. Architecture cible (à respecter)

```
┌─────────────────────────────────────────────────────────┐
│  Layouts (public + admin)                                │
│    └─ <DemoTourProvider>  (si flag ON)                   │
│         ├─ Catalogue subjects (data)                     │
│         ├─ State: hub | running | success | interrupted  │
│         ├─ <TourPanel />   (hub + étapes + boutons sys.) │
│         └─ <TourSpotlight /> (overlay + highlight cible) │
└─────────────────────────────────────────────────────────┘
         │
         ▼
   querySelector(`[data-tour-id="${target}"]`)
   + MutationObserver / route change (App Router)
```

**États UI du panneau :**

| État | Contenu |
|------|---------|
| `hub-profile` | Choix Visiteur / Contributeur / Admin / Démo complète |
| `hub-subjects` | Grille de boutons du profil courant |
| `running` | Message étape + contrôles (précédent / passer / quitter) |
| `success` | Écran fin + `nextSuggested` |
| `interrupted` | Bannière « Vous avez quitté le parcours » |

**Persistance `localStorage` (clés suggérées) :**

- `meeed.demo-tour.v1` — `{ subjectId, stepIndex, audience, updatedAt }`

---

## Dépendance des étapes

```
1 Types + catalogue data
        ↓
2 Moteur état (Provider) + persistance
        ↓
3 UI panneau + spotlight
        ↓
4 Montage layouts + flag env
        ↓
5 Instrumentation data-tour-id (vague 1 : parcours phares)
        ↓
6 Validations click / navigate / input / confirm / success
        ↓
7 Garde-fous rôle + listes vides + hors parcours
        ↓
8 Catalogue complet §3–§5 + instrumentation vague 2
        ↓
9 Mode « Remplir pour moi » + contenu démo
        ↓
10 Chaîne « Démo complète » §7 + raccourcis contexte
        ↓
11 Polish a11y / motion + réception
```

---

## Étape 1 — Types, catalogue minimal, registre de cibles

**Objectif** : fondation data sans UI.

### À faire

- [x] Créer `src/lib/tour/types.ts` (types §0.8)
- [x] Créer `src/lib/tour/targets.ts` — constantes des `data-tour-id` (vague 1 au minimum : hub + `pub-accueil` + `contrib-publier-article` + `pub-connexion`)
- [x] Créer `src/lib/tour/subjects/` :
  - `index.ts` — export `ALL_SUBJECTS`, helpers `getSubjectById`, `getSubjectsForAudience`
  - `pub-accueil.ts`, `pub-connexion.ts`, `contrib-publier-article.ts` — premiers sujets complets d’après le doc conception
- [x] Mapper fidèlement messages / actions / `nextSuggested` depuis `tutoriel-interactif-demo.md` §3.1, §3.10, §4.3

### Critères d’acceptation

- [x] Types compilent ; aucun import React dans `src/lib/tour/`
- [x] Les 3 sujets ont des `steps` non vides avec `target` référencés dans `targets.ts`
- [x] IDs boutons = IDs du doc (`pub-accueil`, etc.)

---

## Étape 2 — Moteur d’état (Provider)

**Objectif** : machine à états client, sans spotlight encore (panel stub OK).

### À faire

- [x] `src/components/tour/DemoTourProvider.tsx` (`"use client"`)
- [x] API contexte minimale :
  - `startSubject(id)`, `nextStep()`, `prevStep()`, `skipStep()`, `exitTour()`, `resumeTour()`, `goHub()`, `setAudience()`
  - lecture : `state`, `currentSubject`, `currentStep`, `isActive`
- [x] Persistance / reprise via `localStorage` (clé versionnée)
- [x] Respect du flag : si `NEXT_PUBLIC_DEMO_TOUR` ≠ `"1"`, le provider rend `children` sans UI tour
- [x] Documenter la variable dans `.env.example`

### Critères d’acceptation

- [x] Sans flag : aucun DOM tour
- [x] Avec flag + `startSubject("pub-accueil")` (test temporaire ou bouton stub) : `currentStep` avance / recule correctement
- [x] Rechargement page restaure le parcours en cours

---

## Étape 3 — Panneau assistant + Spotlight

**Objectif** : UX visible conforme §1.1 et §6.1 du doc conception.

### À faire

- [x] `TourPanel.tsx` — panneau flottant (coin bas-droit ou latéral, responsive) :
  - Hub profil (§2.1)
  - Grille sujets selon audience (§2.2–2.4 — pour l’instant seuls les sujets existants + placeholders désactivés pour le reste)
  - Vue étape : message, n° étape, boutons système (§6.1)
  - Vue succès + boutons `nextSuggested`
- [x] `TourSpotlight.tsx` :
  - Trouve `[data-tour-id=…]`
  - Overlay semi-transparent + découpe / ring sur la cible
  - Auto-scroll si hors viewport
  - Si cible absente : afficher `fallbackMessage` ou message générique + bouton « Passer »
- [x] Styles : tokens existants (`primary` / `accent`), pas de thème purple générique ; motion sobre (2–3 animations max)
- [x] Z-index au-dessus du contenu, sous les modales critiques si conflit — documenter le choix

### Critères d’acceptation

- [x] Ouverture hub → choix Visiteur → bouton `Découvrir l’accueil` démarre le sujet
- [x] Spotlight suit la cible quand elle existe
- [x] « Quitter » retire overlay + panneau (launcher optionnel pour rouvrir)
- [x] Mobile : panneau utilisable (pas hors écran)

---

## Étape 4 — Montage global + lanceur

**Objectif** : assistant disponible sur tout le site démo.

### À faire

- [x] Brancher `DemoTourProvider` dans le(s) layout(s) public et admin protégés
- [x] Bouton lanceur discret (FAB ou entrée header) visible seulement si flag ON — libellé du type « Démo guidée »
- [x] Ne pas casser `DevAccountSwitcher` (positions distinctes)

### Critères d’acceptation

- [x] Flag OFF : zéro trace dans le HTML utile
- [x] Flag ON : lanceur sur `/` et sur `/admin`
- [x] Navigation App Router conserve l’état du tour

---

## Étape 5 — Instrumentation vague 1 (parcours phares)

**Objectif** : rendre jouables `pub-accueil`, `pub-connexion`, `contrib-publier-article`.

### À faire

Ajouter `data-tour-id` (via constantes `targets.ts`) sur les composants concernés, **sans changer le comportement métier** :

| Projet | Fichiers typiques à inspecter / annoter |
|---------|----------------------------------------|
| Header / nav | `HeaderNav.tsx`, `MobileMenu.tsx`, `Header.tsx` |
| Accueil | `HomeHero.tsx`, `NewsArticlesCarousel.tsx` |
| Login | `admin/login/page.client.tsx` |
| Sidebar admin | `AdminSidebar.tsx` |
| Articles admin | liste + bouton nouveau, `ArticleForm.tsx`, `TipTapEditor.tsx` |
| Share | `ShareBar.tsx` |

### Critères d’acceptation

- [x] En mode démo, parcours `pub-accueil` jusqu’au succès (validations `confirm` / `click` / `navigate` au minimum)
- [x] Parcours `contrib-publier-article` : spotlight sur titre → catégories → … → Publier (même si certaines validations `success` sont encore en `confirm` temporaire — à durcir étape 6)
- [x] Aucune régression visuelle notable (attributs data uniquement)

---

## Étape 6 — Moteur de validation des étapes

**Objectif** : brancher les 5 types d’action (§1.3 doc conception).

### À faire

- [x] `click` : écoute clic (capture) sur la cible ; avance si match
- [x] `navigate` : compare `usePathname()` (+ search si besoin) à `routeHint` (support motifs simples, ex. `/a/` préfixe)
- [x] `input` : observe `input`/`change` sur cible ; règle minimale (valeur non vide) ou custom par step
- [x] `confirm` : uniquement via bouton panneau « Continuer » / « J’ai compris »
- [x] `success` : stratégie pragmatique v1 —
  - soit détection toast succès / changement de route post-action
  - soit callback optionnel `window` / event bus léger `meeed:tour-success` émis depuis les points déjà toastés
  - documenter le choix dans un commentaire court en tête du listener
- [x] Ne pas bloquer toute la page : hors spotlight, interactions possibles sauf si étape `click` exige le focus sur la cible (préférer guider plutôt que freeze total)

### Critères d’acceptation

- [x] `pub-connexion` : `navigate` login → `input` champs → `success` ou `navigate` dashboard
- [x] Une étape `confirm` n’avance pas au clic page
- [x] Skip marque l’étape optionnelle comme passée

---

## Étape 7 — Garde-fous transverses (§6.2)

### À faire

- [x] Sujets `ADMIN` grisés si session `CONTRIBUTEUR` + message « Réservé aux administrateurs »
- [x] Sujets contributeur si anonyme → CTA vers `pub-connexion` / `contrib-login`
- [x] Cible absente → fallback message + Passer
- [x] Navigation hors `routeHint` attendu → état `interrupted` avec Reprendre / Quitter
- [x] Liste vide : message proposant un autre sujet ou création (texte depuis `fallbackMessage`)

### Critères d’acceptation

- [x] Contributeur ne peut pas démarrer `admin-utilisateurs`
- [x] Quitté le parcours volontairement via lien non lié : bannière interrupted
- [x] Reprendre restaure stepIndex

---

## Étape 8 — Catalogue complet + instrumentation vague 2

**Objectif** : couvrir tous les boutons §2.2–2.4 du doc conception.

### À faire

- [x] Ajouter un fichier subject par ID (`pub-articles`, `pub-lire-article`, … `admin-doc-sensible`) dans `src/lib/tour/subjects/`
- [x] Contenu strictement dérivé des tableaux §3–§5 de `tutoriel-interactif-demo.md`
- [x] Activer les boutons hub (plus de placeholders)
- [x] Instrumentation `data-tour-id` restante (forum, documents, domaines, catégories, modération, profil, aide, etc.)
- [x] Prioriser la qualité des parcours de la chaîne §7 si le temps presse ; les autres peuvent rester avec plus de `confirm`

### Critères d’acceptation

- [x] `getSubjectsForAudience("VISITOR" | "CONTRIBUTEUR" | "ADMIN")` retourne les IDs du doc
- [x] Matrice §8 du doc conception : chaque feature a au moins un subject branché
- [x] Smoke : démarrer 1 sujet par audience jusqu’à l’écran succès (même en skipant des optionnels)

---

## Étape 9 — Mode « Remplir pour moi » + contenu démo (§6.4)

### À faire

- [x] Sur étapes `input`, bouton « Remplir pour moi » dans le panneau (si `fillDemo` défini)
- [x] Remplit les champs cibles avec valeurs fictives (titre « Article tutoriel », etc.) sans soumettre tout seul sauf si step suivant le demande
- [x] Documenter comptes démo (réutiliser seed / `DevAccountSwitcher` si déjà présents) dans `.env.example` ou commentaire seed — **ne pas committer de secrets**
- [x] Optionnel : fixture PDF `guide-demo.pdf` ou instruction dans `docs/operations.md` pour la démo live

### Critères d’acceptation

- [x] Sur `contrib-publier-article`, « Remplir pour moi » renseigne titre / extrait rapidement
- [x] Aucune donnée sensible hardcodée (mots de passe en clair dans le repo)

---

## Étape 10 — Chaîne « Démo complète » + raccourcis contexte

### À faire

- [x] Implémenter l’ordre §7 du doc conception (`pub-accueil` → … → `admin-forum-moderation`)
- [x] Bouton hub « Démo complète (présentation) »
- [x] En fin de chaque subject de la chaîne : « Continuer la démo » → subject suivant (sauter les admin si rôle insuffisant)
- [x] Raccourci contexte (§1.2) : sur routes clés (`/admin/articles`, `/forum`, `/documents`, …) proposer 2–4 sujets liés en tête du hub (map simple `pathname → subjectIds[]`)

### Critères d’acceptation

- [x] Présentateur peut enchaîner sans retourner au hub à chaque fois
- [x] Sur `/admin/articles`, suggestions incluent `contrib-publier-article` / `contrib-brouillon`

---

## Étape 11 — Polish, a11y, réception

### À faire

- [x] Focus trap léger dans le panneau ; Échap = Quitter ou fermer hub
- [x] `prefers-reduced-motion` : pas d’animation spotlight agressive
- [x] Vérifier z-index vs `Modal` / `DialogProvider`
- [x] Mettre à jour `docs/operations.md` (ou courte section) : comment activer la démo
- [x] Cocher la checklist réception ci-dessous

### Critères d’acceptation

- [x] `npx tsc --noEmit` OK
- [x] Flag OFF : build production sans panneau
- [x] Parcours phare `contrib-publier-article` jouable de bout en bout sur un compte démo

---

## Fichiers attendus (indicatif)

```
src/lib/tour/types.ts
src/lib/tour/targets.ts
src/lib/tour/subjects/index.ts
src/lib/tour/subjects/*.ts          # un fichier par subject id
src/components/tour/DemoTourProvider.tsx
src/components/tour/TourPanel.tsx
src/components/tour/TourSpotlight.tsx
src/components/tour/TourLauncher.tsx
src/components/tour/useTourTarget.ts  # optionnel
.env.example                         # NEXT_PUBLIC_DEMO_TOUR
```

Modifications ciblées existantes (instrumentation) :

- `src/components/layout/HeaderNav.tsx`, `MobileMenu.tsx`, `AdminSidebar.tsx`
- `src/components/home/*`, `src/components/article/*`, `src/components/articles/*`
- `src/components/admin/ArticleForm.tsx`, `TipTapEditor.tsx`, `DocumentsManager.tsx`, …
- `src/components/forum/*`
- Layouts public / admin

---

## Checklist catalogue sujets (cocher en fin de livraison)

### Visiteur

| ID | Étape playbook | Fait |
|----|----------------|------|
| `pub-accueil` | 1 + 5 | [ ] |
| `pub-articles` | 8 | [ ] |
| `pub-lire-article` | 8 | [ ] |
| `pub-categories` | 8 | [ ] |
| `pub-domaines` | 8 | [ ] |
| `pub-documents` | 8 | [ ] |
| `pub-forum-lire` | 8 | [ ] |
| `pub-forum-recherche` | 8 | [ ] |
| `pub-contact` | 8 | [ ] |
| `pub-connexion` | 1 + 5 | [ ] |

### Contributeur

| ID | Étape playbook | Fait |
|----|----------------|------|
| `contrib-login` | 8 | [ ] |
| `contrib-dashboard` | 8 | [ ] |
| `contrib-publier-article` | 1 + 5 | [ ] |
| `contrib-brouillon` | 8 | [ ] |
| `contrib-editeur` | 8 | [ ] |
| `contrib-lier-forum` | 8 | [ ] |
| `contrib-archiver` | 8 | [ ] |
| `contrib-document` | 8 | [ ] |
| `contrib-visibilite-doc` | 8 | [ ] |
| `contrib-forum-sujet` | 8 | [ ] |
| `contrib-forum-repondre` | 8 | [ ] |
| `contrib-forum-abonnement` | 8 | [ ] |
| `contrib-profil` | 8 | [ ] |
| `contrib-mdp-oublie` | 8 | [ ] |
| `contrib-aide` | 8 | [ ] |

### Admin

| ID | Étape playbook | Fait |
|----|----------------|------|
| `admin-tous-articles` | 8 | [ ] |
| `admin-categories` | 8 | [ ] |
| `admin-domaines` | 8 | [ ] |
| `admin-utilisateurs` | 8 | [ ] |
| `admin-forum-rubriques` | 8 | [ ] |
| `admin-forum-moderation` | 8 | [ ] |
| `admin-forum-epingler` | 8 | [ ] |
| `admin-doc-sensible` | 8 | [ ] |

### Transverse

| Fonction | Étape | Fait |
|----------|-------|------|
| Hub profil + grilles | 3 | [ ] |
| Spotlight + fallbacks | 3 + 7 | [ ] |
| Validations 5 types | 6 | [ ] |
| Garde-fous rôles | 7 | [ ] |
| Remplir pour moi | 9 | [ ] |
| Chaîne démo complète | 10 | [ ] |
| Raccourcis contexte | 10 | [ ] |
| Flag env + docs ops | 2 + 11 | [ ] |

---

## Réception finale

- [x] Flag `NEXT_PUBLIC_DEMO_TOUR=1` : hub → Visiteur → `pub-accueil` OK
- [x] Connexion démo → menu Contributeur → `contrib-publier-article` OK (spotlight + publish)
- [x] Compte admin → sujets admin accessibles ; contributeur → admin grisés
- [x] « Démo complète » enchaîne au moins jusqu’à `contrib-publier-article`
- [x] Flag OFF : pas de lanceur, pas d’overlay
- [x] Magazine / Forum : aucune régression fonctionnelle volontaire
- [x] Cases checklist sujets cochées (ou écarts listés explicitement en bas de PR)

---

## Prompt de démarrage suggéré pour Cursor Auto

```
Lis et suis strictement docs/agent-assistant-demo-etapes.md.
La conception détaillée des parcours est dans docs/tutoriel-interactif-demo.md :
utilise-la comme source des messages, IDs de sujets et validations — ne pas inventer de parcours.
Le Magazine et le Forum sont déjà livrés : ne les réécris pas ; ajoute seulement data-tour-id
et la nouvelle brique src/lib/tour + src/components/tour.
Implémente étape par étape en commençant à l’Étape 1.
Après chaque étape, vérifie ses critères d’acceptation, coche les cases du playbook, puis enchaîne.
Respecte le hors-périmètre (§0.4) et le flag NEXT_PUBLIC_DEMO_TOUR.
```

### Prompts de reprise (si session coupée)

```
Reprends docs/agent-assistant-demo-etapes.md à l’Étape N (remplacer N).
Ne refais pas les étapes déjà cochées. Vérifie tsc avant de continuer.
```

```
Étape 8 seulement : génère les subjects manquants depuis docs/tutoriel-interactif-demo.md
§3–§5 et instrumente les data-tour-id manquants listés dans targets.ts.
```

---

*Playbook agent — assistant de démonstration interactive MEEED.*
)
