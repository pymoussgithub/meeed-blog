import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubCategories: TourSubject = {
  id: "pub-categories",
  label: "Explorer un domaine",
  description: "Filtrer les articles par domaine.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-articles", "pub-lire-article"],
  steps: [
    {
      id: "pub-categories-1",
      message: "Ouvrez le menu déroulant pour accéder aux domaines.",
      target: T["nav.header.menu"],
      action: "click",
      fallbackMessage: "Sur mobile, ouvrez le menu hamburger en haut à droite.",
    },
    {
      id: "pub-categories-2",
      message: "Cliquez sur « Domaines ».",
      target: T["nav.header.domaines"],
      action: "navigate",
      routeHint: "/categories",
      fallbackMessage: "Ouvrez le menu puis « Domaines », ou allez sur /categories.",
    },
    {
      id: "pub-categories-3",
      message: "Choisissez un domaine.",
      target: T["category.card"],
      action: "navigate",
      routeHint: "/c/",
      fallbackMessage: "Aucun domaine disponible pour le moment.",
    },
    {
      id: "pub-categories-4",
      message: "Seuls les articles de ce domaine s’affichent.",
      target: T["category.filtered-list"],
      action: "confirm",
    },
  ],
};
