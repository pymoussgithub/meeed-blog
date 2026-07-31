import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribEditeur: TourSubject = {
  id: "contrib-editeur",
  label: "Utiliser l’éditeur riche",
  description: "Titres, gras, listes, liens et images dans TipTap.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-publier-article", "contrib-lier-forum"],
  steps: [
    {
      id: "contrib-editeur-1",
      message: "Ouvrez un article en édition.",
      target: T["admin.articles.list"],
      action: "navigate",
      routeHint: "/admin/articles",
      fallbackMessage: "Créez d’abord un article ou un brouillon.",
    },
    {
      id: "contrib-editeur-2",
      message: "Ajoutez un titre H2 via la barre d’outils.",
      target: T["article.form.editor-h2"],
      action: "confirm",
    },
    {
      id: "contrib-editeur-3",
      message: "Mettez un mot en gras.",
      target: T["article.form.editor-bold"],
      action: "confirm",
    },
    {
      id: "contrib-editeur-4",
      message: "Ajoutez une liste.",
      target: T["article.form.editor-list"],
      action: "confirm",
    },
    {
      id: "contrib-editeur-5",
      message: "Insérez un lien.",
      target: T["article.form.editor-link"],
      action: "confirm",
    },
    {
      id: "contrib-editeur-6",
      message: "Ajoutez une image dans le texte.",
      target: T["article.form.editor-image"],
      action: "confirm",
      optional: true,
      fallbackMessage: "Vous pouvez passer si aucune image n’est prête.",
    },
    {
      id: "contrib-editeur-7",
      message: "Enregistrez.",
      target: T["article.form.save-draft"],
      action: "confirm",
    },
  ],
};
