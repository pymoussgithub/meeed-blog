import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubArticles: TourSubject = {
  id: "pub-articles",
  label: "Parcourir les articles",
  description: "Filtrer et paginer la liste des actualités.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-lire-article", "pub-categories"],
  steps: [
    {
      id: "pub-articles-1",
      message: "Ouvrons la liste des articles.",
      target: T["nav.header.articles"],
      action: "navigate",
      routeHint: "/actualites",
    },
    {
      id: "pub-articles-2",
      message: "Ouvrez les filtres avancés.",
      target: T["articles.filters.toggle"],
      action: "click",
    },
    {
      id: "pub-articles-3",
      message: "Filtrez par mot-clé, domaine ou dates.",
      target: T["articles.filters.panel"],
      action: "confirm",
    },
    {
      id: "pub-articles-4",
      message: "Naviguez vers la page suivante si disponible.",
      target: T["articles.pagination"],
      action: "confirm",
      fallbackMessage: "Une seule page d’articles : passez à l’étape suivante.",
    },
  ],
};
