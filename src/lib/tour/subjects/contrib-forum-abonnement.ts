import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribForumAbonnement: TourSubject = {
  id: "contrib-forum-abonnement",
  label: "S’inscrire à une discussion",
  description: "Activer les notifications et gérer les inscriptions.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-forum-repondre", "contrib-profil"],
  steps: [
    {
      id: "contrib-forum-abonnement-1",
      message: "Ouvrez un sujet.",
      target: T["forum.topic.row"],
      action: "navigate",
      routeHint: "/forum/s/",
    },
    {
      id: "contrib-forum-abonnement-2",
      message: "Activez l’inscription aux notifications.",
      target: T["forum.topic.subscribe"],
      action: "confirm",
    },
    {
      id: "contrib-forum-abonnement-3",
      message: "Gérez vos inscriptions depuis l’espace membre.",
      target: T["admin.sidebar.forum-abonnements"],
      action: "navigate",
      routeHint: "/admin/forum/abonnements",
    },
  ],
};
