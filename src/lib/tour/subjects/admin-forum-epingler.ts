import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminForumEpingler: TourSubject = {
  id: "admin-forum-epingler",
  label: "Épingler / verrouiller un sujet",
  description: "Mettre en avant un sujet et contrôler les réponses.",
  audience: ["ADMIN"],
  nextSuggested: ["admin-forum-moderation", "contrib-forum-repondre"],
  steps: [
    {
      id: "admin-forum-epingler-1",
      message: "Ouvrez un sujet forum.",
      target: T["forum.topic.row"],
      action: "navigate",
      routeHint: "/forum/s/",
    },
    {
      id: "admin-forum-epingler-2",
      message: "Épinglez le sujet (mise en avant).",
      target: T["forum.topic.pin"],
      action: "confirm",
    },
    {
      id: "admin-forum-epingler-3",
      message: "Vérifiez qu’il remonte en tête (accueil / importants).",
      target: T["nav.header.forum"],
      action: "confirm",
      routeHint: "/forum",
    },
    {
      id: "admin-forum-epingler-4",
      message: "Verrouillez le sujet : plus de nouvelles réponses.",
      target: T["forum.topic.lock"],
      action: "confirm",
    },
    {
      id: "admin-forum-epingler-5",
      message: "Déverrouillez pour rouvrir les échanges.",
      target: T["forum.topic.unlock"],
      action: "confirm",
    },
  ],
};
