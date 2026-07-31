# Tutoriel interactif — conception de la démonstration MEEED

Document de conception (pas d’implémentation).  
Objectif : définir un **assistant interactif** qui guide un utilisateur (visiteur, contributeur ou admin) à travers les fonctionnalités principales, via des **boutons de sujets**, puis des **étapes avec mise en évidence** des zones cliquables sur le site.

---

## 1. Concept produit

### 1.1 Principe

L’assistant est un panneau flottant (ou latéral) toujours accessible pendant la démo. Il propose des **sujets** sous forme de boutons. Quand l’utilisateur choisit un sujet, l’assistant :

1. Affiche un court objectif (« Vous allez publier un article »).
2. Enchaîne des **étapes numérotées**.
3. À chaque étape : **surligne / pointe** l’élément UI concerné (spotlight + tooltip), bloque ou oriente le clic utile, et attend la validation (clic réel ou bouton « Étape suivante »).
4. Affiche un **écran de réussite** en fin de parcours, avec boutons vers d’autres sujets connexes.

### 1.2 Modes d’entrée

| Mode | Description |
|------|-------------|
| **Hub démarrage** | Accueil de l’assistant : choix du profil (Visiteur / Contributeur / Admin) puis grille de boutons |
| **Raccourci contexte** | Depuis une page (ex. `/admin/articles`), l’assistant propose les sujets liés à cette page |
| **Chaîne de démo** | Enchaînement préparé pour une présentation live (ordre fixe, bouton « Démo complète ») |

### 1.3 Conventions d’étape

Chaque étape du document suit ce format :

| Champ | Signification |
|-------|----------------|
| **Message assistant** | Texte affiché dans le panneau |
| **Cible UI** | Sélecteur / zone à surligner (`data-tour-id` recommandé à l’implémentation) |
| **Action attendue** | Ce que l’utilisateur doit faire |
| **Validation** | Comment l’assistant passe à l’étape suivante |
| **Fallback** | Si la cible est absente (droits, état vide, etc.) |

**Types de validation :**

- `click` — l’utilisateur clique sur la cible
- `input` — saisie minimale détectée (ex. titre non vide)
- `navigate` — URL / route attendue atteinte
- `confirm` — bouton « J’ai compris » / « Continuer » dans l’assistant
- `success` — action serveur réussie (toast, redirection, statut changé)

---

## 2. Hub — boutons principaux

### 2.1 Choix de profil (premier écran)

| Bouton | Audience | Effet |
|--------|----------|--------|
| **Je découvre le site** | Visiteur (non connecté) | Ouvre le menu « Site public » |
| **Je suis contributeur** | Contributeur connecté | Ouvre le menu « Espace membre » (périmètre contributeur) |
| **Je suis administrateur** | Admin connecté | Ouvre le menu « Espace admin » (tous sujets) |
| **Démo complète (présentation)** | Présentateur | Lance la chaîne §7 |

### 2.2 Menu Visiteur — boutons sujets

| ID bouton | Libellé | Parcours |
|-----------|---------|----------|
| `pub-accueil` | Découvrir l’accueil | §3.1 |
| `pub-articles` | Parcourir les articles | §3.2 |
| `pub-lire-article` | Lire et partager un article | §3.3 |
| `pub-categories` | Explorer une catégorie | §3.4 |
| `pub-projets` | Voir les projets & faire un don | §3.5 |
| `pub-documents` | Consulter / télécharger un PDF | §3.6 |
| `pub-forum-lire` | Lire le forum | §3.7 |
| `pub-forum-recherche` | Rechercher dans le forum | §3.8 |
| `pub-contact` | Contacter l’association | §3.9 |
| `pub-connexion` | Se connecter à l’espace membre | §3.10 |

### 2.3 Menu Contributeur — boutons sujets

| ID bouton | Libellé | Parcours |
|-----------|---------|----------|
| `contrib-login` | Se connecter | §4.1 |
| `contrib-dashboard` | Comprendre le tableau de bord | §4.2 |
| `contrib-publier-article` | Publier un article | §4.3 |
| `contrib-brouillon` | Enregistrer un brouillon | §4.4 |
| `contrib-editeur` | Utiliser l’éditeur riche | §4.5 |
| `contrib-lier-forum` | Lier un article au forum | §4.6 |
| `contrib-archiver` | Archiver / republier un article | §4.7 |
| `contrib-document` | Ajouter un document PDF | §4.8 |
| `contrib-visibilite-doc` | Choisir la visibilité d’un document | §4.9 |
| `contrib-forum-sujet` | Créer un sujet forum | §4.10 |
| `contrib-forum-repondre` | Répondre à une discussion | §4.11 |
| `contrib-forum-abonnement` | S’abonner à une discussion | §4.12 |
| `contrib-profil` | Gérer mon profil / mot de passe | §4.13 |
| `contrib-mdp-oublie` | Mot de passe oublié | §4.14 |
| `contrib-aide` | Ouvrir l’aide intégrée | §4.15 |

### 2.4 Menu Administrateur — boutons sujets (en plus des contributeur)

| ID bouton | Libellé | Parcours |
|-----------|---------|----------|
| `admin-tous-articles` | Gérer tous les articles | §5.1 |
| `admin-categories` | Créer / ordonner les catégories | §5.2 |
| `admin-projets` | Créer un projet | §5.3 |
| `admin-utilisateurs` | Inviter / gérer un utilisateur | §5.4 |
| `admin-forum-rubriques` | Organiser les rubriques forum | §5.5 |
| `admin-forum-moderation` | Modérer le forum | §5.6 |
| `admin-forum-epingler` | Épingler / verrouiller un sujet | §5.7 |
| `admin-doc-sensible` | Document réservé aux admins | §5.8 |

---

## 3. Parcours Visiteur (site public)

### 3.1 Découvrir l’accueil — `pub-accueil`

**Objectif :** comprendre la page magazine et le carrousel d’actualités.

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Voici la page d’accueil MEEED. » | `/` hero | Observer | `confirm` |
| 2 | « Le menu permet d’accéder aux sections principales. » | Header nav | Survol / lecture | `confirm` |
| 3 | « Le carrousel présente les dernières actualités. Cliquez sur une carte. » | Carrousel actualités | Clic carte | `click` → `navigate` article ou actualités |
| 4 | « Vous pouvez aussi ouvrir la liste complète des articles. » | Lien « Articles » / Actualités | Clic | `navigate` `/actualites` |

**Fin :** boutons suggérés → `pub-articles`, `pub-lire-article`.

---

### 3.2 Parcourir les articles — `pub-articles`

**Objectif :** filtrer et paginer la liste `/actualites`.

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrons la liste des articles. » | Nav « Articles » | Clic | `navigate` `/actualites` |
| 2 | « Ouvrez les filtres avancés. » | Bouton filtres / toolbar | Clic | `click` |
| 3 | « Filtrez par mot-clé, catégorie, projet ou dates. » | Panneau filtres | Appliquer ≥ 1 filtre | `confirm` ou changement d’URL |
| 4 | « Naviguez vers la page suivante si disponible. » | Pagination | Clic page 2 (si existe) | `click` ou `confirm` si une seule page |

**Fin :** → `pub-lire-article`, `pub-categories`.

---

### 3.3 Lire et partager un article — `pub-lire-article`

**Objectif :** page article, documents liés, partage.

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un article publié. » | Carte article | Clic | `navigate` `/a/{slug}` |
| 2 | « Titre, métadonnées et couverture. » | En-tête article | Observer | `confirm` |
| 3 | « Faites défiler le contenu. » | Corps article | Scroll | `confirm` |
| 4 | « S’il y a des PDF liés, consultez-en un. » | Liste documents associés | Clic (si présent) | `click` ou `confirm` si aucun |
| 5 | « Partagez via la barre de partage (copie du lien). » | ShareBar | Clic « Copier le lien » | `click` |
| 6 | « Si des discussions forum sont liées, ouvrez-en une. » | Bloc discussions liées | Clic | `click` ou `confirm` |

**Fin :** → `pub-forum-lire`, `pub-documents`.

---

### 3.4 Explorer une catégorie — `pub-categories`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Accédez aux catégories. » | Lien catégories / menu | Clic | `navigate` `/categories` ou `/c/{slug}` |
| 2 | « Choisissez une catégorie. » | Carte / lien catégorie | Clic | `navigate` `/c/{slug}` |
| 3 | « Seuls les articles de cette catégorie s’affichent. » | Liste filtrée | Observer | `confirm` |

---

### 3.5 Voir les projets & faire un don — `pub-projets`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez la page Projets. » | Nav Projets | Clic | `navigate` `/projets` |
| 2 | « Chaque carte présente un projet MEEED. » | Grille projets | Observer | `confirm` |
| 3 | « Ouvrez un projet (si fiche détaillée). » | Carte projet | Clic | `click` |
| 4 | « Un lien de don peut renvoyer vers HelloAsso. » | CTA don | Clic (ou confirm sans ouvrir externe) | `confirm` |

---

### 3.6 Consulter / télécharger un PDF — `pub-documents`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez la bibliothèque Documents. » | Nav Documents | Clic | `navigate` `/documents` |
| 2 | « Utilisez la recherche ou les filtres. » | Toolbar documents | Saisir / filtrer | `confirm` |
| 3 | « Consultez un PDF public. » | Action voir | Clic | `click` |
| 4 | « Téléchargez le fichier. » | Action télécharger | Clic | `click` |

**Note démo :** les documents restreints (contributeurs / admins) ne s’affichent pas pour un anonyme — l’assistant peut le mentionner et proposer `contrib-login`.

---

### 3.7 Lire le forum — `pub-forum-lire`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Entrez sur le forum. » | Nav Forum | Clic | `navigate` `/forum` |
| 2 | « Les rubriques organisent les discussions. » | Tableau / liste rubriques | Observer | `confirm` |
| 3 | « Ouvrez une rubrique. » | Ligne rubrique | Clic | `navigate` `/forum/r/{slug}` ou équivalent |
| 4 | « Ouvrez un sujet. » | Ligne sujet | Clic | `navigate` sujet |
| 5 | « Lecture seule si vous n’êtes pas connecté : la réponse est verrouillée. » | Zone réponse / gate | Observer | `confirm` |

**Fin :** → `pub-forum-recherche`, `pub-connexion`.

---

### 3.8 Rechercher dans le forum — `pub-forum-recherche`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez la recherche forum. » | Lien recherche | Clic | `navigate` `/forum/recherche` |
| 2 | « Saisissez un mot-clé. » | Champ recherche | Saisie | `input` |
| 3 | « Lancez la recherche et ouvrez un résultat. » | Bouton + résultat | Clic | `click` |

---

### 3.9 Contacter l’association — `pub-contact`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Contact. » | Nav Contact | Clic | `navigate` `/contact` |
| 2 | « Utilisez le moyen de contact affiché (mail). » | Lien mailto / formulaire | Clic | `confirm` |

---

### 3.10 Se connecter — `pub-connexion`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Accédez à la connexion. » | Lien connexion / `/admin/login` | Clic | `navigate` |
| 2 | « Saisissez e-mail et mot de passe de démo. » | Champs login | Saisie | `input` |
| 3 | « Validez pour entrer dans l’espace membre. » | Bouton connexion | Clic | `success` → dashboard |

**Fin :** bascule auto vers le menu Contributeur / Admin selon le rôle.

---

## 4. Parcours Contributeur

### 4.1 Se connecter — `contrib-login`

Identique à §3.10, avec prérequis compte contributeur.

---

### 4.2 Comprendre le tableau de bord — `contrib-dashboard`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Voici votre dashboard. » | `/admin` | Observer | `confirm` |
| 2 | « Les compteurs résument publiés, brouillons, archivés, documents. » | Cartes stats | Observer | `confirm` |
| 3 | « Cliquez sur un compteur pour filtrer. » | StatCard | Clic | `navigate` / filtre |
| 4 | « L’onglet Récents montre vos derniers contenus. » | Onglet Récents | Clic | `click` |

---

### 4.3 Publier un article — `contrib-publier-article` ⭐ parcours phare

**Objectif :** de zéro jusqu’à l’article visible sur le site public.

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Nous allons publier un article. Ouvrez le menu Articles. » | Sidebar « Articles » | Clic | `navigate` `/admin/articles` |
| 2 | « Cliquez sur « Nouvel article ». » | Bouton nouvel article | Clic | `navigate` `/admin/articles/nouveau` |
| 3 | « Donnez un titre à l’article. » | Champ titre | Saisie | `input` |
| 4 | « Choisissez au moins une catégorie. » | Sélecteur catégories | Sélection | `input` |
| 5 | « Rédigez un court extrait (idéal 120–160 caractères). » | Champ extrait | Saisie | `input` |
| 6 | « Ajoutez une image de couverture. » | Zone upload couverture | Upload / sélection | `success` upload ou `confirm` si image démo préchargée |
| 7 | « Rédigez le corps dans l’éditeur. » | TipTap | Saisie minimale | `input` |
| 8 | « Cliquez sur « Publier » pour mettre en ligne. » | Bouton Publier | Clic | `success` |
| 9 | « Ouvrez l’aperçu public pour vérifier le rendu. » | Lien aperçu public | Clic | `navigate` `/a/{slug}` |
| 10 | « L’article apparaît aussi dans Actualités. » | Lien Actualités (optionnel) | Clic ou confirm | `confirm` |

**Fin :** → `contrib-lier-forum`, `contrib-editeur`, `contrib-document`.

**Fallback :** si champs incomplets au clic Publier → l’assistant pointe les erreurs de validation.

---

### 4.4 Enregistrer un brouillon — `contrib-brouillon`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez la création ou l’édition d’un article. » | Articles → nouveau / éditer | Clic | `navigate` formulaire |
| 2 | « Remplissez au minimum le titre. » | Champ titre | Saisie | `input` |
| 3 | « Cliquez sur « Enregistrer brouillon ». » | Bouton brouillon | Clic | `success` |
| 4 | « Vérifiez le statut Brouillon dans la liste. » | Liste articles filtrée | Observer | `confirm` |
| 5 | « Le brouillon n’est pas visible sur le site public. » | — | Confirm | `confirm` |

---

### 4.5 Utiliser l’éditeur riche — `contrib-editeur`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un article en édition. » | Liste → article | Clic | `navigate` |
| 2 | « Ajoutez un titre H2 via la barre d’outils. » | Toolbar TipTap H2 | Clic + saisie | `confirm` |
| 3 | « Mettez un mot en gras. » | Bouton gras | Clic | `confirm` |
| 4 | « Ajoutez une liste. » | Bouton liste | Clic | `confirm` |
| 5 | « Insérez un lien. » | Bouton lien | Clic | `confirm` |
| 6 | « Ajoutez une image dans le texte. » | Upload image inline | Upload | `success` ou `confirm` |
| 7 | « Enregistrez. » | Enregistrer | Clic | `success` |

---

### 4.6 Lier un article au forum — `contrib-lier-forum`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un article (création ou édition). » | Formulaire article | Navigate | `navigate` |
| 2 | « Trouvez la zone « Discussions forum liées ». » | Panneau forum | Spotlight | `confirm` |
| 3a | **Option A** — « Parcourez le forum pour lier un sujet existant. » | Bouton « Parcourir le forum » | Clic → sélection | `success` |
| 3b | **Option B** — « Ou préparez une nouvelle discussion (titre, rubrique, message). » | Formulaire nouvelle discussion | Remplir + ajouter | `success` |
| 4 | « Enregistrez l’article pour appliquer les liaisons (surtout à la création). » | Enregistrer | Clic | `success` |
| 5 | « Côté public : ouvrez l’article et cliquez une discussion liée. » | Bloc discussions | Clic | `navigate` forum |
| 6 | « Dans le sujet, le bloc article de référence renvoie vers le blog. » | Bloc article lié | Clic | `navigate` article |

---

### 4.7 Archiver / republier — `contrib-archiver`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un article publié. » | Liste articles | Clic | `navigate` |
| 2 | « Archivez-le pour le retirer du site. » | Action Archiver | Clic + confirm | `success` |
| 3 | « Vérifiez qu’il n’apparaît plus en public. » | Aperçu / actualités | Confirm | `confirm` |
| 4 | « Republiez-le. » | Action Republier | Clic | `success` |

---

### 4.8 Ajouter un document PDF — `contrib-document`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Documents dans le menu. » | Sidebar Documents | Clic | `navigate` `/admin/documents` |
| 2 | « Renseignez le titre. » | Champ titre | Saisie | `input` |
| 3 | « Choisissez la visibilité (ex. Tout le monde). » | Sélecteur visibilité | Sélection | `input` |
| 4 | « Sélectionnez un PDF (max 25 Mo) et validez. » | Zone upload | Upload | `success` |
| 5 | « Liez-le éventuellement à un article ou un projet. » | Actions liaison | Clic | `confirm` |
| 6 | « Vérifiez-le sur la bibliothèque publique si public. » | Lien `/documents` | Clic | `navigate` |

---

### 4.9 Visibilité d’un document — `contrib-visibilite-doc`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un document existant. » | Liste documents | Clic / édition | `click` |
| 2 | « Trois niveaux : Tout le monde / Contributeurs+admins / Admins uniquement. » | Sélecteur | Spotlight | `confirm` |
| 3 | « Passez en « Contributeurs + admins », enregistrez. » | Sélecteur + save | Clic | `success` |
| 4 | « En navigation privée, le PDF disparaît de `/documents`. » | — | Confirm (ou ouvrir onglet anonyme) | `confirm` |

---

### 4.10 Créer un sujet forum — `contrib-forum-sujet`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Cliquez sur « Nouveau sujet ». » | Sidebar / lien | Clic | `navigate` `/forum/nouveau` |
| 2 | « Choisissez une rubrique. » | Sélecteur rubrique | Sélection | `input` |
| 3 | « Donnez un titre clair. » | Champ titre | Saisie | `input` |
| 4 | « Rédigez le message initial. » | Éditeur | Saisie | `input` |
| 5 | « Publiez le sujet. » | Bouton publier | Clic | `success` → page sujet |
| 6 | « Le sujet apparaît dans sa rubrique. » | Fil d’Ariane / liste | Confirm | `confirm` |

---

### 4.11 Répondre à une discussion — `contrib-forum-repondre`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un sujet ouvert. » | Liste sujets | Clic | `navigate` |
| 2 | « Rédigez une réponse en bas de page. » | ReplyForm | Saisie | `input` |
| 3 | « Publiez. » | Bouton publier réponse | Clic | `success` |
| 4 | « Votre message apparaît dans le fil. » | Dernier post | Confirm | `confirm` |

**Fallback :** sujet verrouillé → l’assistant explique et propose `admin-forum-epingler` (côté admin) ou un autre sujet.

---

### 4.12 S’abonner à une discussion — `contrib-forum-abonnement`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un sujet. » | Sujet | Navigate | `navigate` |
| 2 | « Activez l’abonnement (notifications). » | Toggle abonnement | Clic | `success` |
| 3 | « Gérez vos abonnements depuis l’espace membre. » | Sidebar « Abonnements discussions » | Clic | `navigate` `/admin/forum/abonnements` |

---

### 4.13 Gérer mon profil — `contrib-profil`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Mon profil. » | Sidebar | Clic | `navigate` `/admin/profil` |
| 2 | « Modifiez le nom affiché et enregistrez. » | Champ nom + save | Clic | `success` |
| 3 | « (Optionnel) Changez le mot de passe. » | Bloc mot de passe | Confirm | `confirm` |

---

### 4.14 Mot de passe oublié — `contrib-mdp-oublie`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Depuis la connexion, cliquez sur « Mot de passe oublié ». » | Lien | Clic | `navigate` `/mot-de-passe-oublie` |
| 2 | « Saisissez l’e-mail du compte. » | Champ e-mail | Saisie | `input` |
| 3 | « Envoyez la demande : un e-mail de réinitialisation part. » | Bouton envoyer | Clic | `success` |
| 4 | « Ouvrez le lien reçu (ou lien de démo) pour choisir un nouveau mot de passe. » | Page reset | Navigate | `navigate` `/reinitialiser-mot-de-passe` |

---

### 4.15 Ouvrir l’aide intégrée — `contrib-aide`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Aide dans le menu. » | Sidebar Aide | Clic | `navigate` `/admin/aide` |
| 2 | « Recherchez une fiche (ex. « publier »). » | Champ recherche aide | Saisie | `input` |
| 3 | « Ouvrez une fiche et suivez ses étapes. » | Carte aide | Clic | `confirm` |

---

## 5. Parcours Administrateur

### 5.1 Gérer tous les articles — `admin-tous-articles`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « En admin, la liste Articles montre tous les auteurs. » | `/admin/articles` | Observer | `confirm` |
| 2 | « Filtrez par statut, catégorie ou recherche. » | Toolbar | Appliquer filtre | `confirm` |
| 3 | « Ouvrez l’article d’un autre auteur et éditez-le. » | Ligne article | Clic | `navigate` |

---

### 5.2 Créer / ordonner les catégories — `admin-categories`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Catégories. » | Sidebar | Clic | `navigate` `/admin/categories` |
| 2 | « Ajoutez une catégorie (nom, description, couleur). » | Formulaire création | Remplir + valider | `success` |
| 3 | « Réordonnez par glisser-déposer. » | Lignes tableau | Drag | `success` ou `confirm` |
| 4 | « Vérifiez l’ordre sur le site public. » | Lien public catégories | Confirm | `confirm` |

---

### 5.3 Créer un projet — `admin-projets`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Projets → Nouveau projet. » | Sidebar + bouton | Clic | `navigate` `/admin/projets/nouveau` |
| 2 | « Renseignez titre, résumé, description. » | Champs formulaire | Saisie | `input` |
| 3 | « Ajoutez une couverture et une catégorie. » | Upload + select | Remplir | `input` |
| 4 | « Ajoutez un lien de don HelloAsso si besoin, activez le projet. » | Champs don / actif | Remplir | `input` |
| 5 | « Enregistrez. » | Bouton save | Clic | `success` |
| 6 | « Réordonnez dans le tableau, puis vérifiez `/projets`. » | DnD + public | Confirm | `confirm` |

---

### 5.4 Inviter / gérer un utilisateur — `admin-utilisateurs`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Utilisateurs. » | Sidebar | Clic | `navigate` `/admin/utilisateurs` |
| 2 | « Créez un compte (e-mail, rôle Contributeur). » | Formulaire création | Remplir + valider | `success` |
| 3 | « Changez un rôle ou activez / désactivez un compte. » | Actions ligne | Clic | `success` |
| 4 | « Déclenchez une réinitialisation de mot de passe si besoin. » | Action reset | Clic | `confirm` |

---

### 5.5 Organiser les rubriques forum — `admin-forum-rubriques`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Rubriques (Forum). » | Sidebar | Clic | `navigate` `/admin/forum/rubriques` |
| 2 | « Ajoutez une rubrique. » | Formulaire | Créer | `success` |
| 3 | « Réordonnez par glisser-déposer. » | Tableau | Drag | `confirm` |
| 4 | « Vérifiez l’ordre sur `/forum`. » | Lien forum | Navigate | `navigate` |

---

### 5.6 Modérer le forum — `admin-forum-moderation`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez Modération. » | Sidebar | Clic | `navigate` `/admin/forum` |
| 2 | « Parcourez sujets et messages. » | Tableaux modération | Observer | `confirm` |
| 3 | « Masquez un contenu inapproprié. » | Action Masquer | Clic | `success` |
| 4 | « Vérifiez qu’il disparaît du front public. » | — | Confirm | `confirm` |
| 5 | « Restaurez-le si besoin. » | Action Restaurer | Clic | `success` |
| 6 | « Déplacez un sujet vers une autre rubrique. » | Action Déplacer | Clic | `success` |

---

### 5.7 Épingler / verrouiller un sujet — `admin-forum-epingler`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Ouvrez un sujet forum. » | Sujet | Navigate | `navigate` |
| 2 | « Épinglez le sujet (mise en avant). » | Action épingler | Clic | `success` |
| 3 | « Vérifiez qu’il remonte en tête (accueil / importants). » | `/forum` ou `/forum/importants` | Confirm | `confirm` |
| 4 | « Verrouillez le sujet : plus de nouvelles réponses. » | Action verrouiller | Clic | `success` |
| 5 | « Déverrouillez pour rouvrir les échanges. » | Action déverrouiller | Clic | `success` |

---

### 5.8 Document réservé aux admins — `admin-doc-sensible`

| # | Message assistant | Cible UI | Action attendue | Validation |
|---|-------------------|----------|-----------------|------------|
| 1 | « Uploadez ou éditez un document. » | Documents admin | Navigate | `navigate` |
| 2 | « Choisissez « Admins uniquement ». » | Visibilité | Sélection | `input` |
| 3 | « Enregistrez : invisible aux contributeurs et anonymes. » | Save | Clic | `success` |

---

## 6. Comportements transverses de l’assistant

### 6.1 Boutons système (toujours visibles dans le panneau)

| Bouton | Action |
|--------|--------|
| **Menu sujets** | Retour à la grille de boutons du profil courant |
| **Étape précédente** | Recule d’une étape (repositionne le spotlight) |
| **Passer cette étape** | Skip si optionnel (`confirm` forcé) |
| **Quitter le tutoriel** | Ferme l’assistant, retire overlays |
| **Reprendre** | Reprend le dernier parcours non terminé (localStorage) |

### 6.2 Prérequis & garde-fous

| Situation | Comportement assistant |
|-----------|------------------------|
| Sujet admin alors que rôle = contributeur | Bouton grisé + message « Réservé aux administrateurs » |
| Non connecté sur parcours contributeur | Propose d’abord `pub-connexion` |
| Liste vide (pas d’article, pas de PDF) | Propose de créer le contenu ou d’utiliser des fixtures démo |
| Cible hors viewport | Auto-scroll vers la cible avant spotlight |
| Navigation hors parcours | Bannière « Vous avez quitté le parcours — Reprendre / Quitter » |

### 6.3 Attributs techniques recommandés (pour plus tard)

Sur les éléments clés du DOM :

```html
data-tour-id="admin.articles.new-button"
data-tour-id="article.form.title"
data-tour-id="article.form.publish"
data-tour-id="forum.reply.submit"
```

Chaque étape du tutoriel référence un `data-tour-id` stable.

### 6.4 Contenu de démo suggéré

Pour une démo fluide sans saisie longue :

- Compte **démo-contributeur** / **démo-admin**
- Article brouillon prérempli « Article tutoriel »
- PDF d’exemple « guide-demo.pdf »
- Rubrique forum « Démonstration »
- Mode « **Remplir pour moi** » sur les étapes `input` (remplit des valeurs fictives)

---

## 7. Chaîne « Démo complète » (présentation live)

Ordre recommandé (~15–20 min) :

| Ordre | Bouton / parcours | Durée indicative |
|-------|-------------------|------------------|
| 1 | `pub-accueil` | 1 min |
| 2 | `pub-lire-article` | 2 min |
| 3 | `pub-documents` | 1 min |
| 4 | `pub-forum-lire` | 1 min |
| 5 | `pub-connexion` | 1 min |
| 6 | `contrib-dashboard` | 1 min |
| 7 | `contrib-publier-article` | 4 min |
| 8 | `contrib-lier-forum` | 2 min |
| 9 | `contrib-document` | 2 min |
| 10 | `contrib-forum-sujet` + `contrib-forum-repondre` | 2 min |
| 11 | `admin-categories` (si admin) | 1 min |
| 12 | `admin-forum-moderation` (si admin) | 2 min |

À chaque fin de parcours : bouton **« Continuer la démo »** → suivant de la chaîne.

---

## 8. Matrice de couverture features ↔ boutons

| Feature (recette / produit) | Bouton(s) tutoriel |
|-----------------------------|--------------------|
| Accueil magazine / carrousel | `pub-accueil` |
| Liste + filtres articles | `pub-articles` |
| Page article + partage | `pub-lire-article` |
| Catégories publiques | `pub-categories` |
| Projets + don | `pub-projets` |
| Bibliothèque PDF | `pub-documents`, `contrib-document` |
| Visibilité documents | `contrib-visibilite-doc`, `admin-doc-sensible` |
| Forum lecture / recherche | `pub-forum-lire`, `pub-forum-recherche` |
| Connexion / profil / MDP | `pub-connexion`, `contrib-profil`, `contrib-mdp-oublie` |
| Dashboard | `contrib-dashboard` |
| Publier / brouillon / éditeur | `contrib-publier-article`, `contrib-brouillon`, `contrib-editeur` |
| Archiver | `contrib-archiver` |
| Lien article ↔ forum | `contrib-lier-forum` |
| Sujet / réponse / abonnement | `contrib-forum-sujet`, `contrib-forum-repondre`, `contrib-forum-abonnement` |
| Catégories / projets admin | `admin-categories`, `admin-projets` |
| Utilisateurs | `admin-utilisateurs` |
| Rubriques / modération / épinglage | `admin-forum-rubriques`, `admin-forum-moderation`, `admin-forum-epingler` |
| Aide wiki admin | `contrib-aide` |

---

## 9. Structure de données cible (implémentation future)

Schéma logique d’un parcours (pour référence, non codé) :

```ts
type TourAudience = "VISITOR" | "CONTRIBUTEUR" | "ADMIN";

type TourStep = {
  id: string;
  message: string;
  target: string; // data-tour-id
  action: "click" | "input" | "navigate" | "confirm" | "success";
  routeHint?: string;
  optional?: boolean;
  fallbackMessage?: string;
};

type TourSubject = {
  id: string;
  label: string; // libellé du bouton
  description: string;
  audience: TourAudience[];
  steps: TourStep[];
  nextSuggested?: string[]; // ids de boutons
};
```

---

## 10. Prochaines étapes (hors scope de ce doc)

1. Valider la liste des boutons avec le client / l’équipe.
2. Ajouter les `data-tour-id` sur l’UI existante.
3. Implémenter le panneau assistant + spotlight.
4. Brancher les parcours §3–§5.
5. Ajouter le mode « Remplir pour moi » et les comptes démo.
6. Brancher la chaîne §7 pour les présentations.

---

*Document de conception — assistant de démonstration interactive MEEED.*
)
