import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubForumRecherche: TourSubject = {
  id: "pub-forum-recherche",
  label: "Rechercher dans le forum",
  description: "Trouver un sujet via la recherche forum.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-forum-lire", "pub-connexion"],
  steps: [
    {
      id: "pub-forum-recherche-1",
      message: "Ouvrez la recherche forum.",
      target: T["forum.search.link"],
      action: "navigate",
      routeHint: "/forum/recherche",
    },
    {
      id: "pub-forum-recherche-2",
      message: "Saisissez un mot-clé.",
      target: T["forum.search.input"],
      action: "input",
      fillDemo: { [T["forum.search.input"]]: "démonstration" },
    },
    {
      id: "pub-forum-recherche-3",
      message: "Lancez la recherche et ouvrez un résultat.",
      target: T["forum.search.submit"],
      action: "click",
      fallbackMessage: "Aucun résultat : essayez un autre mot-clé ou créez un sujet démo.",
    },
  ],
};
