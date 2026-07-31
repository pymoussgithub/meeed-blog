import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribArchiver: TourSubject = {
  id: "contrib-archiver",
  label: "Archiver / republier un article",
  description: "Retirer un article du site puis le republier.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-publier-article", "admin-tous-articles"],
  steps: [
    {
      id: "contrib-archiver-1",
      message: "Ouvrez un article publié.",
      target: T["admin.articles.list"],
      action: "navigate",
      routeHint: "/admin/articles",
      fallbackMessage: "Publiez d’abord un article via le parcours publier.",
    },
    {
      id: "contrib-archiver-2",
      message: "Archivez-le pour le retirer du site.",
      target: T["admin.articles.archive"],
      action: "confirm",
    },
    {
      id: "contrib-archiver-3",
      message: "Vérifiez qu’il n’apparaît plus en public.",
      target: T["article.public-preview"],
      action: "confirm",
      optional: true,
    },
    {
      id: "contrib-archiver-4",
      message: "Republiez-le.",
      target: T["admin.articles.republish"],
      action: "confirm",
    },
  ],
};
