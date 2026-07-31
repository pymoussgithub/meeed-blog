import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminForumModeration: TourSubject = {
  id: "admin-forum-moderation",
  label: "Modérer le forum",
  description: "Masquer, restaurer et déplacer des contenus forum.",
  audience: ["ADMIN"],
  nextSuggested: ["admin-forum-epingler", "admin-forum-rubriques"],
  steps: [
    {
      id: "admin-forum-moderation-1",
      message: "Ouvrez Modération.",
      target: T["admin.sidebar.forum"],
      action: "navigate",
      routeHint: "/admin/forum",
    },
    {
      id: "admin-forum-moderation-2",
      message: "Parcourez sujets et messages.",
      target: T["admin.forum.moderation"],
      action: "confirm",
    },
    {
      id: "admin-forum-moderation-3",
      message: "Masquez un contenu inapproprié.",
      target: T["admin.forum.hide"],
      action: "confirm",
    },
    {
      id: "admin-forum-moderation-4",
      message: "Vérifiez qu’il disparaît du front public.",
      target: T["admin.forum.moderation"],
      action: "confirm",
    },
    {
      id: "admin-forum-moderation-5",
      message: "Restaurez-le si besoin.",
      target: T["admin.forum.restore"],
      action: "confirm",
    },
    {
      id: "admin-forum-moderation-6",
      message: "Déplacez un sujet vers une autre rubrique.",
      target: T["admin.forum.move"],
      action: "confirm",
      optional: true,
    },
  ],
};
