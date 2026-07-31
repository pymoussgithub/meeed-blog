import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribPublierArticle: TourSubject = {
  id: "contrib-publier-article",
  label: "Publier un article",
  description: "De zéro jusqu’à l’article visible sur le site public.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-lier-forum", "contrib-editeur", "contrib-document"],
  steps: [
    {
      id: "contrib-publier-1",
      message: "Nous allons publier un article. Ouvrez le menu Articles.",
      target: T["admin.sidebar.articles"],
      action: "navigate",
      routeHint: "/admin/articles",
    },
    {
      id: "contrib-publier-2",
      message: "Cliquez sur « Nouvel article ».",
      target: T["admin.articles.new-button"],
      action: "navigate",
      routeHint: "/admin/articles/nouveau",
    },
    {
      id: "contrib-publier-3",
      message: "Donnez un titre à l’article.",
      target: T["article.form.title"],
      action: "input",
      fillDemo: { [T["article.form.title"]]: "Article tutoriel" },
    },
    {
      id: "contrib-publier-4",
      message: "Choisissez au moins une catégorie.",
      target: T["article.form.categories"],
      action: "input",
      fallbackMessage: "Aucune catégorie disponible. Créez-en une via le parcours admin catégories.",
    },
    {
      id: "contrib-publier-5",
      message: "Rédigez un court extrait (idéal 120–160 caractères).",
      target: T["article.form.excerpt"],
      action: "input",
      fillDemo: {
        [T["article.form.excerpt"]]:
          "Extrait de démonstration pour le tutoriel interactif MEEED — environ cent vingt caractères pour l’aperçu.",
      },
    },
    {
      id: "contrib-publier-6",
      message: "Ajoutez une image de couverture.",
      target: T["article.form.cover"],
      action: "confirm",
      optional: true,
      fallbackMessage: "Vous pouvez passer cette étape si aucune image n’est prête.",
    },
    {
      id: "contrib-publier-7",
      message: "Rédigez le corps dans l’éditeur.",
      target: T["article.form.body"],
      action: "input",
      fillDemo: {
        [T["article.form.body"]]: "Contenu de démonstration rédigé pour le parcours tutoriel MEEED.",
      },
    },
    {
      id: "contrib-publier-8",
      message: "Cliquez sur « Publier » pour mettre en ligne.",
      target: T["article.form.publish"],
      action: "success",
    },
    {
      id: "contrib-publier-9",
      message: "Ouvrez l’aperçu public pour vérifier le rendu.",
      target: T["article.public-preview"],
      action: "navigate",
      routeHint: "/a/",
      optional: true,
      fallbackMessage: "Ouvrez l’article depuis la liste Actualités si le lien d’aperçu n’est pas visible.",
    },
    {
      id: "contrib-publier-10",
      message: "L’article apparaît aussi dans Actualités.",
      target: T["nav.header.articles"],
      action: "confirm",
      optional: true,
    },
  ],
};
