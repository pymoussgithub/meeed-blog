export type HelpLink = {
  href: string;
  label: string;
};

export type HelpArticle = {
  id: string;
  category: string;
  title: string;
  summary: string;
  keywords: string[];
  steps?: string[];
  tips?: string[];
  links?: HelpLink[];
};

export type HelpAudience = "CONTRIBUTEUR" | "ADMIN";

const SHARED_ARTICLES: HelpArticle[] = [
  {
    id: "dashboard",
    category: "Prise en main",
    title: "Utiliser le tableau de bord",
    summary:
      "Le dashboard résume votre activité : articles publiés, brouillons, archivés et documents.",
    keywords: ["dashboard", "accueil", "compteurs", "vue d'ensemble", "stats"],
    steps: [
      "Ouvrez Dashboard dans le menu de gauche.",
      "Cliquez sur un compteur (Publiés, Brouillons, Archivés, Documents) pour filtrer la liste.",
      "Utilisez l’onglet « Récents » pour retrouver vos derniers contenus modifiés.",
    ],
    links: [{ href: "/admin", label: "Ouvrir le dashboard" }],
  },
  {
    id: "profil",
    category: "Prise en main",
    title: "Gérer mon profil",
    summary: "Mettez à jour votre nom affiché et changez votre mot de passe depuis Mon profil.",
    keywords: ["profil", "nom", "mot de passe", "compte", "sécurité"],
    steps: [
      "Allez dans Mon profil.",
      "Modifiez votre nom affiché puis enregistrez.",
      "Pour changer le mot de passe : saisissez l’ancien, puis le nouveau (deux fois), et validez.",
    ],
    tips: [
      "Le nom affiché apparaît comme auteur sur vos articles et dans le forum.",
      "Choisissez un mot de passe long et unique.",
    ],
    links: [{ href: "/admin/profil", label: "Mon profil" }],
  },
  {
    id: "article-creer",
    category: "Articles",
    title: "Créer et publier un article",
    summary:
      "Rédigez un article avec titre, extrait, contenu riche et éventuellement une image de couverture, puis publiez-le.",
    keywords: [
      "article",
      "créer",
      "publier",
      "brouillon",
      "éditeur",
      "tiptap",
      "couverture",
      "actualité",
      "forum",
    ],
    steps: [
      "Allez dans Articles → « Nouvel article », ou utilisez le bouton du dashboard.",
      "Renseignez le titre, choisissez au moins un domaine, et rédigez un extrait court (idéal : 120–160 caractères).",
      "Ajoutez une image de couverture si vous en avez une (format paysage recommandé, ex. 1200×675 px) — elle reste optionnelle.",
      "Rédigez le contenu dans l’éditeur : titres H2/H3, gras, listes, liens, images dans le texte.",
      "Si besoin, préparez une liaison avec le forum (sujet existant ou nouvelle discussion) — voir la fiche « Lier un article au forum ».",
      "Cliquez sur « Enregistrer brouillon » pour sauvegarder sans publier, ou « Publier » pour mettre en ligne.",
    ],
    tips: [
      "Un extrait clair améliore l’affichage dans les listes et lors d’un partage (WhatsApp, etc.).",
      "Structurez le texte avec des sous-titres pour faciliter la lecture sur mobile.",
      "Vérifiez l’aperçu public avant de partager l’article.",
    ],
    links: [
      { href: "/admin/articles/nouveau", label: "Nouvel article" },
      { href: "/admin/articles", label: "Mes articles" },
    ],
  },
  {
    id: "article-forum",
    category: "Articles",
    title: "Lier un article au forum",
    summary:
      "Associez un article à une discussion existante, ou créez une nouvelle discussion dédiée en même temps que l’article.",
    keywords: [
      "forum",
      "discussion",
      "lier",
      "associer",
      "sujet",
      "pré-liée",
      "parcourir",
      "article",
      "lien",
    ],
    steps: [
      "Ouvrez la création ou l’édition d’un article. La zone « Discussions forum liées » apparaît pendant la création ; une fois l’article enregistré, vous gérez les liaisons depuis le panneau dédié de la page d’édition.",
      "Option A — Lier un sujet existant : cliquez sur « Parcourir le forum », recherchez la discussion, sélectionnez-la puis validez. Le sujet est mis en file d’attente (création) ou lié immédiatement (édition).",
      "Option B — Créer une discussion nouvelle : renseignez le titre, la rubrique forum et un message initial, puis cliquez sur « Ajouter à la file d’attente » (création) ou créez-la directement depuis le panneau d’édition.",
      "Pendant la création d’un nouvel article, les liaisons (sujets existants ou discussions préparées) ne sont appliquées qu’au premier enregistrement du brouillon : c’est à ce moment que les nouvelles discussions sont réellement créées et liées.",
      "Après enregistrement, les lecteurs peuvent naviguer entre l’article et les discussions liées (et inversement) sur le site public.",
      "Vous pouvez retirer une association à tout moment sans supprimer la discussion du forum.",
    ],
    tips: [
      "Créez une discussion dédiée si vous attendez des questions ou des retours autour de l’article.",
      "Si le débat existe déjà, liez le sujet existant plutôt que d’en créer un doublon.",
      "Un article peut être lié à plusieurs discussions si cela a du sens.",
      "Le message initial d’une nouvelle discussion sert d’accroche : présentez brièvement le sujet et invitez aux échanges.",
    ],
    links: [
      { href: "/admin/articles/nouveau", label: "Nouvel article" },
      { href: "/admin/articles", label: "Mes articles" },
      { href: "/forum", label: "Voir le forum" },
    ],
  },
  {
    id: "article-gerer",
    category: "Articles",
    title: "Modifier, archiver ou supprimer un article",
    summary:
      "Retrouvez vos articles, changez leur statut, archivez-les ou supprimez définitivement un contenu déjà archivé.",
    keywords: ["modifier", "éditer", "archiver", "supprimer", "statut", "republier"],
    steps: [
      "Ouvrez Articles pour voir la liste (filtrable par statut, domaine ou recherche).",
      "Cliquez sur un article pour l’éditer, puis enregistrez vos changements.",
      "Pour le retirer du site public : archivez-le. Vous pourrez le republier plus tard.",
      "La suppression définitive n’est possible que pour un article déjà archivé.",
    ],
    tips: [
      "En tant que contributeur, vous ne voyez et ne gérez que vos propres articles.",
      "Archivez plutôt que supprimer si vous pourriez republier le contenu.",
    ],
    links: [{ href: "/admin/articles", label: "Liste des articles" }],
  },
  {
    id: "documents-upload",
    category: "Documents",
    title: "Ajouter un document PDF",
    summary:
      "Uploadez un PDF, choisissez sa visibilité, puis associez-le éventuellement à un article ou un domaine.",
    keywords: ["document", "pdf", "upload", "téléverser", "fichier", "cloudinary"],
    steps: [
      "Ouvrez Documents.",
      "Renseignez le titre (et un descriptif optionnel).",
      "Choisissez le niveau de visibilité (voir la fiche « Qui peut voir un document »).",
      "Sélectionnez le fichier PDF (25 Mo max) et validez l’upload.",
      "Si besoin, liez le document à un article et/ou un domaine depuis la liste.",
    ],
    tips: [
      "Un titre explicite facilite la recherche dans la bibliothèque publique.",
      "Vous pouvez modifier la visibilité ou les liaisons après l’upload.",
    ],
    links: [{ href: "/admin/documents", label: "Gérer les documents" }],
  },
  {
    id: "documents-visibilite",
    category: "Documents",
    title: "Qui peut voir un document",
    summary:
      "Trois niveaux de visibilité contrôlent qui peut consulter ou télécharger chaque PDF.",
    keywords: [
      "visibilité",
      "public",
      "privé",
      "restreint",
      "badge",
      "accès",
      "télécharger",
    ],
    steps: [
      "Tout le monde : visible sans connexion sur la page Documents du site.",
      "Contributeurs + admins : réservé aux comptes connectés (contributeurs et administrateurs).",
      "Admins uniquement : réservé aux administrateurs.",
    ],
    tips: [
      "Choisissez « Contributeurs + admins » pour les documents de travail internes.",
      "Utilisez « Admins uniquement » pour les fichiers sensibles (comptes, contrats, etc.).",
    ],
    links: [
      { href: "/admin/documents", label: "Documents" },
      { href: "/documents", label: "Bibliothèque publique" },
    ],
  },
  {
    id: "forum-sujet",
    category: "Forum",
    title: "Créer un sujet sur le forum",
    summary:
      "Posez une question ou partagez une expérience en créant un sujet dans la bonne rubrique.",
    keywords: ["forum", "sujet", "topic", "nouveau", "discussion", "question"],
    steps: [
      "Dans le menu, ouvrez « Nouveau sujet » (ou Forum → Nouveau sujet).",
      "Choisissez la rubrique la plus adaptée.",
      "Donnez un titre clair (question, besoin ou retour d’expérience).",
      "Décrivez le contexte dans le corps du message, puis publiez.",
    ],
    tips: [
      "Un titre précis attire plus vite des réponses utiles.",
      "Pour rattacher un sujet à un article du blog, voir la fiche « Lier un article au forum ».",
    ],
    links: [
      { href: "/forum/nouveau", label: "Nouveau sujet" },
      { href: "/forum", label: "Voir le forum" },
    ],
  },
  {
    id: "forum-repondre",
    category: "Forum",
    title: "Répondre à une discussion",
    summary: "Participez aux échanges en répondant dans un sujet existant.",
    keywords: ["répondre", "réponse", "commentaire", "discussion", "échange"],
    steps: [
      "Ouvrez le forum, puis le sujet concerné.",
      "Rédigez votre réponse dans l’éditeur en bas de page.",
      "Publiez : votre message apparaît dans le fil de discussion.",
    ],
    tips: [
      "Répondez avec du contexte concret (étapes déjà tentées, photos, liens utiles).",
      "Certains sujets fermés n’acceptent plus de nouvelles réponses.",
    ],
    links: [{ href: "/forum", label: "Forum" }],
  },
  {
    id: "site-public",
    category: "Site public",
    title: "Retrouver vos contenus sur le site",
    summary:
      "Après publication, articles et documents publics sont visibles côté site pour les lecteurs.",
    keywords: ["site", "public", "accueil", "actualités", "aperçu", "partage"],
    steps: [
      "Les articles publiés apparaissent dans Actualités et sur la page d’accueil.",
      "Les PDF « Tout le monde » sont listés sur la page Documents.",
      "Depuis l’édition d’un article, utilisez l’aperçu public pour vérifier le rendu.",
    ],
    links: [
      { href: "/actualites", label: "Actualités" },
      { href: "/documents", label: "Documents" },
      { href: "/", label: "Accueil du site" },
    ],
  },
];

const ADMIN_ONLY_ARTICLES: HelpArticle[] = [
  {
    id: "admin-articles-tous",
    category: "Administration",
    title: "Voir et gérer tous les articles",
    summary:
      "En tant qu’administrateur, vous voyez l’ensemble des articles de tous les auteurs et pouvez les modifier.",
    keywords: ["tous", "auteurs", "modérer article", "éditer", "admin"],
    steps: [
      "Ouvrez Articles : la liste affiche tous les contenus, pas seulement les vôtres.",
      "Filtrez par statut, domaine ou recherche pour retrouver un article.",
      "Éditez, archivez ou republiez n’importe quel article si nécessaire.",
    ],
    tips: [
      "Préférez contacter l’auteur avant une modification importante de son contenu.",
      "L’archivage retire l’article du site sans le supprimer définitivement.",
    ],
    links: [{ href: "/admin/articles", label: "Tous les articles" }],
  },
  {
    id: "admin-categories",
    category: "Administration",
    title: "Gérer les domaines",
    summary:
      "Créez et organisez les domaines utilisés pour classer les articles du magazine.",
    keywords: ["domaine", "thématique", "classer", "slug", "couleur", "ordre", "catégorie"],
    steps: [
      "Ouvrez Domaines dans le menu Contenu.",
      "Ajoutez un domaine (nom, description, couleur).",
      "Réordonnez l’apparition en glissant-déposant les lignes du tableau.",
    ],
    tips: [
      "Évitez de supprimer un domaine encore lié à des articles publiés.",
      "L’ordre du tableau correspond à l’ordre d’affichage sur le site public.",
    ],
    links: [{ href: "/admin/categories", label: "Domaines" }],
  },
  {
    id: "admin-utilisateurs",
    category: "Administration",
    title: "Gérer les utilisateurs",
    summary:
      "Invitez, activez ou désactivez des comptes, changez les rôles et réinitialisez un mot de passe.",
    keywords: [
      "utilisateur",
      "compte",
      "rôle",
      "admin",
      "contributeur",
      "activer",
      "désactiver",
      "mot de passe",
    ],
    steps: [
      "Ouvrez Utilisateurs dans le menu Administration.",
      "Recherchez un compte ou filtrez par rôle / statut.",
      "Créez un utilisateur, changez son rôle (Contributeur / Administrateur), ou activez / désactivez l’accès.",
      "Utilisez la réinitialisation de mot de passe si la personne a perdu l’accès.",
    ],
    tips: [
      "Désactivez plutôt que supprimer pour conserver l’historique des contenus.",
      "Réservez le rôle Administrateur aux personnes qui doivent gérer le site.",
    ],
    links: [{ href: "/admin/utilisateurs", label: "Utilisateurs" }],
  },
  {
    id: "admin-forum-moderation",
    category: "Forum (admin)",
    title: "Modérer le forum",
    summary:
      "Masquez, restaurez ou déplacez des contenus pour garder des discussions saines et organisées.",
    keywords: [
      "modération",
      "masquer",
      "restaurer",
      "déplacer",
      "signalement",
      "modérer",
    ],
    steps: [
      "Ouvrez Modération dans la section Forum du menu.",
      "Parcourez les sujets et messages à traiter.",
      "Masquez un contenu inapproprié, ou restaurez-le si besoin.",
      "Déplacez un sujet vers une autre rubrique si le classement est incorrect.",
    ],
    tips: [
      "Expliquez brièvement une action de modération quand c’est utile pour l’équipe.",
      "Les contributeurs n’ont pas accès à cet écran.",
    ],
    links: [{ href: "/admin/forum", label: "Modération du forum" }],
  },
  {
    id: "admin-forum-rubriques",
    category: "Forum (admin)",
    title: "Organiser les rubriques du forum",
    summary:
      "Créez et ordonnez les rubriques qui structurent l’accueil du forum pour les membres.",
    keywords: ["rubrique", "catégorie forum", "organiser", "ordre", "structure"],
    steps: [
      "Ouvrez Rubriques dans la section Forum.",
      "Ajoutez une rubrique avec un nom clair (le slug sert d’URL).",
      "Réordonnez l’apparition en glissant-déposant les lignes du tableau (sans filtres).",
    ],
    tips: [
      "Des rubriques trop nombreuses diluent les discussions : gardez une structure simple.",
      "L’ordre du tableau correspond à l’ordre d’affichage sur /forum.",
    ],
    links: [
      { href: "/admin/forum/rubriques", label: "Rubriques" },
      { href: "/forum", label: "Aperçu du forum" },
    ],
  },
  {
    id: "admin-documents-visibilite",
    category: "Documents",
    title: "Documents réservés aux admins",
    summary:
      "Utilisez le niveau « Admins uniquement » pour les PDF sensibles, invisibles aux contributeurs.",
    keywords: ["sensible", "confidentiel", "admins uniquement", "restreint"],
    steps: [
      "Lors de l’upload (ou ensuite), choisissez la visibilité « Admins uniquement ».",
      "Seuls les administrateurs verront et pourront télécharger ce fichier.",
      "Les contributeurs ne le verront ni dans Documents admin, ni sur le site public.",
    ],
    links: [{ href: "/admin/documents", label: "Documents" }],
  },
  {
    id: "admin-cloudinary",
    category: "Administration",
    title: "Compte Cloudinary : accès et espace restant",
    summary:
      "Les images et PDF du site sont hébergés chez Cloudinary. Le quota (stockage, bande passante, transformations) se consulte dans la console Cloudinary, pas dans le back-office MEEED.",
    keywords: [
      "cloudinary",
      "quota",
      "espace",
      "stockage",
      "bande passante",
      "crédits",
      "console",
      "dashboard",
      "compte",
      "plan",
      "usage",
      "limite",
      "médias",
    ],
    steps: [
      "Ouvrez la console Cloudinary : https://console.cloudinary.com — connectez-vous avec le compte association (identifiants partagés entre admins techniques, hors MEEED).",
      "Sur le Dashboard (Home → Dashboard), consultez l’usage des 30 derniers jours : stockage utilisé, bande passante livrée et transformations (crédits du plan).",
      "Pour le détail et l’historique : Home → Usage Reports. Pour le plan et les plafonds du mois : Settings → Billing / Plan details.",
      "Vérifiez que vous êtes sur le bon « Product environment » (cloud de prod vs. cloud de dev) via le sélecteur en haut de la console — le cloud name correspond à CLOUDINARY_CLOUD_NAME côté serveur.",
      "Si le quota approche la limite : libérez de l’espace (supprimer médias inutiles dans Media Library, ou contenus orphelins), ou envisagez un upgrade de plan depuis Billing.",
    ],
    tips: [
      "L’espace restant n’apparaît pas dans /admin : seul le tableau de bord Cloudinary affiche le quota.",
      "L’usage affiché sur 30 jours est une fenêtre glissante (pas un reset au 1er du mois).",
      "Ne partagez jamais CLOUDINARY_API_SECRET hors des admins techniques ; les clés vivent dans les variables d’environnement (Heroku / .env local).",
      "En production, le health check /api/health peut confirmer que Cloudinary répond, sans indiquer le quota restant.",
    ],
    links: [
      {
        href: "https://console.cloudinary.com/app/home/dashboard",
        label: "Dashboard Cloudinary",
      },
      {
        href: "https://console.cloudinary.com/app/home/usage-reports",
        label: "Rapports d’usage",
      },
      { href: "/api/health", label: "Health check du site" },
    ],
  },
];

export function getHelpArticles(audience: HelpAudience): HelpArticle[] {
  if (audience === "ADMIN") {
    return [...SHARED_ARTICLES, ...ADMIN_ONLY_ARTICLES];
  }
  return SHARED_ARTICLES;
}

export function getHelpIntro(audience: HelpAudience) {
  if (audience === "ADMIN") {
    return {
      title: "Aide administrateur",
      description:
        "Guide pour publier du contenu, gérer le site et modérer le forum. Utilisez la recherche pour trouver rapidement une rubrique.",
    };
  }

  return {
    title: "Aide contributeur",
    description:
      "Guide pour publier des articles, gérer vos documents et participer au forum. Utilisez la recherche pour trouver rapidement une rubrique.",
  };
}

export function articleMatchesQuery(article: HelpArticle, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    article.category,
    article.title,
    article.summary,
    ...article.keywords,
    ...(article.steps ?? []),
    ...(article.tips ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}
