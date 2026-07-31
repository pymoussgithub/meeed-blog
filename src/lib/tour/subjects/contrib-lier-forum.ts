import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribLierForum: TourSubject = {
  id: "contrib-lier-forum",
  label: "Lier un article au forum",
  description: "Associer des discussions forum à un article (parcours sujet existant).",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-forum-sujet", "contrib-publier-article"],
  steps: [
    {
      id: "contrib-lier-forum-1",
      message: "Ouvrez un article (création ou édition).",
      target: T["admin.articles.list"],
      action: "navigate",
      routeHint: "/admin/articles",
    },
    {
      id: "contrib-lier-forum-2",
      message: "Trouvez la zone « Discussions forum liées ».",
      target: T["article.form.forum-links"],
      action: "confirm",
    },
    {
      id: "contrib-lier-forum-3",
      message: "Parcourez le forum pour lier un sujet existant.",
      target: T["article.form.forum-links"],
      action: "confirm",
      fallbackMessage: "Aucun sujet disponible : créez-en un via le parcours créer un sujet forum.",
    },
    {
      id: "contrib-lier-forum-4",
      message: "Enregistrez l’article pour appliquer les liaisons (surtout à la création).",
      target: T["article.form.save-draft"],
      action: "confirm",
    },
    {
      id: "contrib-lier-forum-5",
      message: "Côté public : ouvrez l’article et cliquez une discussion liée.",
      target: T["article.linked-topics"],
      action: "navigate",
      routeHint: "/forum/",
      optional: true,
      fallbackMessage: "Publiez d’abord l’article pour voir le bloc discussions liées.",
    },
    {
      id: "contrib-lier-forum-6",
      message: "Dans le sujet, le bloc article de référence renvoie vers le blog.",
      target: T["forum.linked-article"],
      action: "confirm",
      optional: true,
    },
  ],
};
