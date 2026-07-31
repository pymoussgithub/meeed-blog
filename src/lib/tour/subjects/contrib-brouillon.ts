import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribBrouillon: TourSubject = {
  id: "contrib-brouillon",
  label: "Enregistrer un brouillon",
  description: "Sauver un article sans le publier sur le site.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-publier-article", "contrib-editeur"],
  steps: [
    {
      id: "contrib-brouillon-1",
      message: "Ouvrez la création ou l’édition d’un article.",
      target: T["admin.articles.new-button"],
      action: "navigate",
      routeHint: "/admin/articles/nouveau",
    },
    {
      id: "contrib-brouillon-2",
      message: "Remplissez au minimum le titre.",
      target: T["article.form.title"],
      action: "input",
      fillDemo: { [T["article.form.title"]]: "Brouillon tutoriel" },
    },
    {
      id: "contrib-brouillon-3",
      message: "Cliquez sur « Enregistrer brouillon ».",
      target: T["article.form.save-draft"],
      action: "success",
    },
    {
      id: "contrib-brouillon-4",
      message: "Vérifiez le statut Brouillon dans la liste.",
      target: T["admin.articles.list"],
      action: "confirm",
      routeHint: "/admin/articles",
    },
    {
      id: "contrib-brouillon-5",
      message: "Le brouillon n’est pas visible sur le site public.",
      target: T["admin.articles.list"],
      action: "confirm",
    },
  ],
};
