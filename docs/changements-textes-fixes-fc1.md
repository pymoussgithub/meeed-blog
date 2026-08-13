# Changements de textes fixes — FC1

Source : `Referentiel-textes-fixes-MEEED FC1.doc` (évolution FC version 1 du 1er août 2026).

Règle : pour chaque ligne dont la colonne **Nouveau texte proposé** n’est pas vide, remplacer le **Texte actuel** par le **Nouveau texte proposé** dans l’élément identifié par **Réf.**

Ce document ne fait **aucun** changement dans le code. L’application se fera ensuite, **étape par étape**, après validation.

---

## Synthèse

| | |
|---|---|
| Lignes du référentiel | 158 |
| Lignes avec un nouveau texte | **29** |
| Remplacements de libellé / paragraphe | 24 |
| Suppressions demandées (« A enlever ») | 3 |
| Notes client (pas un texte à coller tel quel) | 2 |

**À valider avant application** (ne pas coller tel quel sans décision) :

- **ACC-15, ACC-17, ACC-19** : le nouveau texte est « A enlever » → suppression des 3 cartes (Eau / Énergie / Savoir-faire), pas un remplacement de phrase.
- **PRJ-06** : « ?????  il y aura de base les projets actuels » → commentaire, pas un message d’interface.
- **NAV-03, ACC-05, PRJ-05, PRJ-06, PRJ-08** : le référentiel parle encore de « projets » / `/projets`. Le site actuel a renommé cela en **Domaines** (`/categories`).
- Plusieurs formulations proposées contiennent des coquilles (retranscrites fidèlement ci-dessous, sans correction).

---

## Étape 1 — Coordonnées (`COO`)

Fichier principal : `src/lib/content/site.ts`  
Affichage : `src/app/(public)/contact/page.tsx`, `src/components/layout/Footer.tsx`

### 1.1 — COO-03 — Adresse, ligne 2

| | |
|---|---|
| **Réf.** | COO-03 |
| **Élément** | Adresse — ligne 2 |
| **Texte actuel** | Cyprès |
| **Nouveau texte** | Cyprès 1 |
| **Code actuel** | `"Cyprès"` dans `SITE_CONTACT.addressLines` |

### 1.2 — COO-04 — Adresse, ligne 3

| | |
|---|---|
| **Réf.** | COO-04 |
| **Élément** | Adresse — ligne 3 |
| **Texte actuel** | N106270 Villeneuve-Loubet |
| **Nouveau texte** | 06270 Villeneuve-Loubet |
| **Code actuel** | `"N106270 Villeneuve-Loubet"` |

### 1.3 — COO-05 — Téléphone (affichage)

| | |
|---|---|
| **Réf.** | COO-05 |
| **Élément** | Téléphone (affichage) |
| **Texte actuel** | 06 24 39 57 67 |
| **Nouveau texte** | (+33) 06 24 39 57 67 |
| **Code actuel** | `phoneDisplay: "06 24 39 57 67"` (`phone` technique inchangé : `+33624395767`) |

Note : le format proposé mélange indicatif international et le 0 national. À confirmer (variante usuelle : `+33 6 24 39 57 67`).

---

## Étape 2 — Navigation (`NAV`)

### 2.1 — NAV-02 — Menu principal

| | |
|---|---|
| **Réf.** | NAV-02 |
| **Élément** | Lien menu |
| **Texte actuel** | Nos articles |
| **Nouveau texte** | Articles |
| **Code actuel** | `src/components/layout/HeaderNav.tsx` : `"Nos articles"` — `src/lib/navigation.ts` a déjà `"Articles"` |

### 2.2 — NAV-03 — Menu principal

| | |
|---|---|
| **Réf.** | NAV-03 |
| **Élément** | Lien menu |
| **Texte actuel** | Nos projets |
| **Nouveau texte** | Projets |
| **Code actuel** | le menu n’a plus « Nos projets » : `HeaderNav` affiche **Domaines** (`/categories`) |

**Point de validation** : appliquer « Projets » (revenir en arrière sur le renommage Domaines), ou ignorer cette ligne car le libellé a déjà changé.

---

## Étape 3 — Accueil, bandeau (`ACC-03` à `ACC-05`)

Fichier : `src/components/home/HomeHero.tsx`

### 3.1 — ACC-03 — Paragraphe d’introduction

| | |
|---|---|
| **Réf.** | ACC-03 |
| **Élément** | Paragraphe d’introduction |

**Texte actuel (référentiel)**  
Solutions innovantes pour un maraîchage efficient en eau et en énergie décarbonée. Retrouvez nos actualités, projets et documents pour la transition agricole.

**Nouveau texte**  
Solutions innovantes pour une agriculture plus efficiente en eau et en énergie décarbonée. Retrouvez nos actualités, projets et documents pour la transition agricole. Ces solutions sont principalement adaptées aux exploitation de petites dimensions comme le sont le plus souvent les exploitations de maraichage

**Code actuel** (déjà légèrement différent du référentiel : « domaines » au lieu de « projets »)  
Solutions innovantes pour un maraîchage efficient en eau et en énergie décarbonée. Retrouvez nos actualités, domaines et documents pour la transition agricole.

**Point de validation** : coller le nouveau texte tel quel (avec « projets »), ou adapter « projets » → « domaines » pour rester cohérent avec le site.

### 3.2 — ACC-04 — Bouton

| | |
|---|---|
| **Réf.** | ACC-04 |
| **Texte actuel** | Nos articles |
| **Nouveau texte** | Articles |
| **Code actuel** | bouton `"Nos articles"` vers `/actualites` |

### 3.3 — ACC-05 — Bouton

| | |
|---|---|
| **Réf.** | ACC-05 |
| **Texte actuel** | Nos projets |
| **Nouveau texte** | Projets |
| **Code actuel** | bouton **Domaines** vers `/categories` |

Même question que NAV-03.

---

## Étape 4 — Accueil, message de bienvenue (`ACC-12` à `ACC-19`)

Fichier : `src/components/home/HomeWelcome.tsx`

### 4.1 — ACC-12 — Paragraphe 1

**Texte actuel**  
L'association MEEED établit, décrit et maintient un savoir-faire sur des solutions et moyens technologiques applicables à un maraîchage efficient en eau et en énergie décarbonée. Nous communiquons, informons et formons pour diffuser ce savoir-faire en France et dans l'espace francophone.

**Nouveau texte**  
L'association MEEED analyse, développe, test et décrit des savoir-faire sur des solutions et moyens technologiques visant une réduction des consommations d’eau et une décarbonation de l’agriculture avec un focus sur le maraichage. Nous diffusons ces savoir-faire en France et dans l'espace francophone.

### 4.2 — ACC-13 — Paragraphe 2

**Texte actuel (référentiel)**  
Notre équipe de bénévoles imagine des projets pragmatiques et réplicables pour apporter à la culture maraîchère des solutions innovantes. Une fois nos projets testés, les documents de création sont mis à disposition.

**Nouveau texte**  
Notre équipe de bénévoles imagine des projets pragmatiques et réplicables pour apporter à l’agriculture des solutions innovantes. Une fois ces projets travaillés, réalisés et testés, des documents descriptifs sont mis à disposition au sein de ce blog ou par des formations

**Code actuel** (déjà « domaines » au lieu de « projets »)  
Notre équipe de bénévoles imagine des domaines pragmatiques et réplicables pour apporter à la culture maraîchère des solutions innovantes. Une fois nos domaines testés, les documents de création sont mis à disposition.

**Point de validation** : coller le nouveau texte (avec « projets ») ou conserver « domaines ».

### 4.3 — ACC-15 — Carte « Eau » (description)

| | |
|---|---|
| **Réf.** | ACC-15 |
| **Texte actuel** | Des solutions techniques pour réduire la consommation d'eau en maraîchage de petite et moyenne dimension. |
| **Nouveau texte** | A enlever |

### 4.4 — ACC-17 — Carte « Énergie décarbonée » (description)

| | |
|---|---|
| **Réf.** | ACC-17 |
| **Texte actuel** | Des alternatives aux énergies fossiles pour l'autonomie énergétique et la décarbonation des exploitations. |
| **Nouveau texte** | A enlever |

### 4.5 — ACC-19 — Carte « Savoir-faire » (description)

| | |
|---|---|
| **Réf.** | ACC-19 |
| **Texte actuel** | Communication, formation et dossiers réplicables pour diffuser nos solutions auprès du monde agricole. |
| **Nouveau texte** | A enlever |

**Point de validation** : les titres ACC-14 / ACC-16 / ACC-18 (« Eau », « Énergie décarbonée », « Savoir-faire ») n’ont pas de nouveau texte. Interprétation la plus probable : **supprimer les 3 cartes entières** (bloc `HIGHLIGHTS`). Alternative : laisser les titres sans description.

---

## Étape 5 — Page À propos (`APR`) — `/a-propos`

Fichier : `src/app/(public)/a-propos/page.tsx`

### 5.1 — APR-02 — Description SEO

**Texte actuel**  
L'association MEEED établit et diffuse un savoir-faire sur le maraîchage efficient en eau et en énergie décarbonée.

**Nouveau texte**  
Communiquer, informer et former sur ces solutions afin de diffuser ce savoir-faire auprès du monde agricole, en France et dans l'espace francophone.

Note : ce nouveau texte est identique à APR-08 (objet, point 2), qui n’est pas modifié.

### 5.2 — APR-07 — Objet, point 1

**Texte actuel**  
Établir, décrire et maintenir un savoir-faire sur des solutions et moyens technologiques applicables à un maraîchage de petite et moyenne dimension, visant un usage efficient de l'eau et des énergies décarbonées.

**Nouveau texte**  
L'association MEEED développe, test et décrit des savoir-faire sur des solutions et moyens technologiques visant une réduction des consommations d’eau et une décarbonation de l’agriculture avec un focus sur le maraichage. Nous diffusons ces savoir-faire en France et dans l'espace francophone.

Note : très proche d’ACC-12. Le point 1 de la liste commencerait alors par « L'association MEEED… » alors que l’intro APR-06 (« L'association MEEED a pour objet : ») reste inchangée.

### 5.3 — APR-09 — Objet, point 3

**Texte actuel**  
Développer et faire évoluer les solutions déjà connues pour améliorer les consommations d'eau et les bilans carbone, par des alternatives innovantes et plus performantes — et, quand c'est possible, concevoir des prototypes adaptés, plus performants ou moins chers, pour une diffusion plus large.

**Nouveau texte**  
Développer et faire évoluer des solutions capable d’améliorer les consommations d'eau et les bilans carbone, par des alternatives innovantes et  performantes — et, quand nécessaire et possible, concevoir des prototypes démonstratifs

### 5.4 — APR-10 — Objet, point 4

**Texte actuel**  
Agir de façon générale sur toutes les activités liées aux énergies renouvelables, à l'autonomie énergétique, à la décarbonation et à l'optimisation des usages de l'eau et de l'énergie.

**Nouveau texte**  
Agir de façon générale sur toutes les activités liées aux énergies renouvelables, à l'autonomie énergétique, à la décarbonation et à l'optimisation des usages de l'eau et de l'énergie dans l’agriculture

### 5.5 — APR-12 — Paragraphe (approche)

**Texte actuel (référentiel)**  
MEEED est une équipe de bénévoles qui imagine des projets pragmatiques et réplicables pour apporter à la culture maraîchère des solutions innovantes sur l'eau et l'énergie.

**Nouveau texte**  
MEEED est une équipe de bénévoles qui imagine des projets pragmatiques et réplicables pour apporter à l’agriculture des solutions innovantes sur l'eau et l'énergie.

**Code actuel** : « domaines » et « culture maraîchère » (pas « projets »).

### 5.6 — APR-13 — Approche, point 1

**Texte actuel**  
Des idées techniques pour réduire la consommation d'eau et la dépendance aux énergies fossiles.

**Nouveau texte**  
Des idées techniques pour réduire la consommation d'eau et la dépendance aux énergies fossiles des exploitation agricoles de petites et moyennes dimensions

---

## Étape 6 — Page Contact (`CTC`) — `/contact`

Fichier : `src/app/(public)/contact/page.tsx`

### 6.1 — CTC-04 — Introduction

**Texte actuel**  
Pour nous écrire, discuter de vos projets maraîchers ou en savoir plus sur nos réalisations.

**Nouveau texte**  
Pour nous écrire, discuter de nos ou de vos projets, en savoir plus sur comment participer à la communauté MEEED.

---

## Étape 7 — Page Faire un don (`DON`) — `/don`

Fichier : `src/app/(public)/don/page.tsx`

### 7.1 — DON-02 — Description SEO

**Texte actuel**  
Soutenez l'association MEEED et contribuez au développement de solutions pour un maraîchage efficient en eau et en énergie décarbonée.

**Nouveau texte**  
Soutenez l'association MEEED et contribuez au développement de solutions innovantes pour une agriculture plus efficiente en eau et en énergie décarbonée.

### 7.2 — DON-04 — Chapô

**Texte actuel**  
MEEED est une association loi 1901 d'intérêt général, portée par des bénévoles. Vos dons nous permettent de développer, tester et diffuser des solutions concrètes pour un maraîchage plus économe en eau et moins dépendant des énergies fossiles.

**Nouveau texte**  
MEEED est une association loi 1901 d'intérêt général, portée par des bénévoles. Vos dons nous permettent de développer, tester et diffuser des solutions concrètes pour une agriculture plus économe en eau et moins dépendant des énergies fossiles.

### 7.3 — DON-06 — Paragraphe

**Texte actuel (référentiel)**  
Les dons sont collectés via HelloAsso, plateforme sécurisée dédiée aux associations. Vous pouvez choisir le montant de votre contribution et, si vous le souhaitez, la affecter à l'association ou à l'un de nos projets en cours.

**Nouveau texte**  
Les dons sont collectés via HelloAsso, plateforme sécurisée dédiée aux associations. Vous pouvez choisir librement le montant de votre contribution.

**Code actuel** : même phrase, avec « domaines » au lieu de « projets ».

---

## Étape 8 — Page projets (`PRJ`)

Référentiel : page **Nos projets** — `/projets`.  
**Code actuel** : cette page n’existe plus. L’équivalent le plus proche est **Domaines** — `/categories` (`src/app/(public)/categories/page.tsx`), dont les textes sont déjà différents.

### 8.1 — PRJ-05 — Introduction

**Texte actuel**  
Des sujets pragmatiques et innovants, réplicables, pour faire évoluer le maraîchage vers des solutions plus économiques en eau et en énergie, avec moins d'impact carbone.

**Nouveau texte**  
Des sujets pragmatiques et innovants, réplicables, pour faire évoluer l’agriculture et plus particulièrement le maraichage vers des solutions plus économiques en eau et en énergie, avec moins d'impact carbone.

**Code actuel (page Domaines)**  
Chaque domaine ouvre sur les articles du magazine. Choisissez un sujet pour parcourir les contenus publiés.

**Point de validation** : remplacer l’intro Domaines par ce nouveau texte, ou ignorer PRJ-05 (page projets disparue).

### 8.2 — PRJ-06 — Message si aucun projet

**Texte actuel**  
Les projets seront bientôt disponibles. Revenez prochainement.

**Nouveau texte**  
?????  il y aura de base les projets actuels

**Interprétation** : ce n’est pas un libellé à afficher. Le client indique qu’il y aura toujours des projets (donc ce message vide ne devrait plus servir / n’est plus pertinent).  
**Code actuel** : « Aucun domaine disponible pour le moment. »

### 8.3 — PRJ-08 — Paragraphe

**Texte actuel**  
MEEED est une association jeune. Nos projets sont en phase de développement et d'expérimentation sur le terrain. Cette section accueille les avancées, documents descriptifs et vidéos au fil du temps.

**Nouveau texte**  
MEEED est à la recherche permanente de nouveaux projets. Certains de ces  projets sont encore en phase de développement et d'expérimentation sur le terrain. Cette section accueille les avancées, documents descriptifs et vidéos au fil du temps.

**Code actuel** : ce paragraphe n’existe pas sur la page Domaines.

---

## Étape 9 — Page articles (`ART`) — `/actualites`

Fichier : `src/app/(public)/actualites/page.tsx`

### 9.1 — ART-03 — Titre page (H1)

| | |
|---|---|
| **Réf.** | ART-03 |
| **Texte actuel** | Nos articles |
| **Nouveau texte** | Articles |
| **Code actuel** | `<h1 className="sr-only">Nos articles</h1>` — le titre SEO (`metadata.title`) est aussi « Nos articles » (ART-01, **non** modifié dans le référentiel) |

**Point de validation** : changer uniquement le H1, ou aussi le titre d’onglet (ART-01) pour rester cohérent.

---

## Étape 10 — Forum (`FOR`)

### 10.1 — FOR-02 — Description SEO — `/forum/acces`

Fichier : `src/app/(public)/forum/acces/page.tsx`

**Texte actuel**  
Le forum MEEED est réservé aux membres. Connectez-vous ou créez un compte pour y accéder.

**Nouveau texte**  
Pour participer au forum, connectez-vous et  créez un compte

### 10.2 — FOR-11 — Description SEO — `/forum`

Fichier : `src/app/(public)/forum/page.tsx`

**Texte actuel (référentiel)**  
Échangez autour des projets MEEED, posez vos questions et suivez les discussions de la communauté.

**Nouveau texte**  
Échangez autour des projets MEEED, posez vos questionnement à la communauté MEEED et  trouvez des réponses dans les discussions de la communauté.

**Code actuel**  
Échangez autour des domaines MEEED, posez vos questions et suivez les discussions de la communauté.

---

## Ordre prévu pour l’application (prochain prompt)

Quand tu diras **« effectues les changements étape par étape »**, chaque étape ci-dessous sera proposée, puis appliquée seulement si tu valides.

1. COO-03, COO-04, COO-05 — coordonnées  
2. NAV-02 (et NAV-03 si tu confirmes le sort de « Projets » vs « Domaines »)  
3. ACC-03, ACC-04, ACC-05 — hero  
4. ACC-12, ACC-13 — bienvenue  
5. ACC-15, ACC-17, ACC-19 — suppression des cartes  
6. APR-02, APR-07, APR-09, APR-10, APR-12, APR-13 — à propos  
7. CTC-04 — contact  
8. DON-02, DON-04, DON-06 — don  
9. PRJ-05, PRJ-06, PRJ-08 — projets / domaines  
10. ART-03 — H1 articles  
11. FOR-02, FOR-11 — SEO forum  

Les textes seront collés **tels que proposés dans le Word**, sauf si tu demandes une correction de coquille ou une adaptation « projets » → « domaines ».
