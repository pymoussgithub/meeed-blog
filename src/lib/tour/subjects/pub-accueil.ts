import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubAccueil: TourSubject = {
  id: "pub-accueil",
  label: "Découvrir l’accueil",
  description: "Comprendre la page magazine et le carrousel d’actualités.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-articles", "pub-lire-article"],
  steps: [
    {
      id: "pub-accueil-1",
      message: "Voici la page d’accueil MEEED.",
      target: T["home.hero"],
      action: "confirm",
      routeHint: "/",
    },
    {
      id: "pub-accueil-2",
      message: "Le menu permet d’accéder aux sections principales.",
      target: T["nav.header.root"],
      action: "confirm",
    },
    {
      id: "pub-accueil-3",
      message: "Le carrousel présente les dernières actualités. Cliquez sur une carte.",
      target: T["home.news-carousel"],
      action: "click",
      routeHint: "/a/",
      fallbackMessage: "Aucun article dans le carrousel. Passez à l’étape suivante ou ouvrez Actualités.",
    },
    {
      id: "pub-accueil-4",
      message: "Vous pouvez aussi ouvrir la liste complète des articles.",
      target: T["nav.header.articles"],
      action: "navigate",
      routeHint: "/actualites",
    },
  ],
};
