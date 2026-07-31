import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubForumLire: TourSubject = {
  id: "pub-forum-lire",
  label: "Lire le forum",
  description: "Parcourir rubriques et sujets en lecture seule.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-forum-recherche", "pub-connexion"],
  steps: [
    {
      id: "pub-forum-lire-1",
      message: "Entrez sur le forum.",
      target: T["nav.header.forum"],
      action: "navigate",
      routeHint: "/forum",
    },
    {
      id: "pub-forum-lire-2",
      message: "Les rubriques organisent les discussions.",
      target: T["forum.categories.table"],
      action: "confirm",
    },
    {
      id: "pub-forum-lire-3",
      message: "Ouvrez une rubrique.",
      target: T["forum.category.row"],
      action: "navigate",
      routeHint: "/forum/r/",
    },
    {
      id: "pub-forum-lire-4",
      message: "Ouvrez un sujet.",
      target: T["forum.topic.row"],
      action: "navigate",
      routeHint: "/forum/s/",
      fallbackMessage: "Aucun sujet dans cette rubrique : essayez une autre ou créez-en un après connexion.",
    },
    {
      id: "pub-forum-lire-5",
      message: "Lecture seule si vous n’êtes pas connecté : la réponse est verrouillée.",
      target: T["forum.topic.reply-gate"],
      action: "confirm",
    },
  ],
};
