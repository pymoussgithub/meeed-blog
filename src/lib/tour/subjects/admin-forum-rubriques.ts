import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminForumRubriques: TourSubject = {
  id: "admin-forum-rubriques",
  label: "Organiser les rubriques forum",
  description: "Créer et réordonner les rubriques du forum.",
  audience: ["ADMIN"],
  nextSuggested: ["admin-forum-moderation", "pub-forum-lire"],
  steps: [
    {
      id: "admin-forum-rubriques-1",
      message: "Ouvrez Rubriques (Forum).",
      target: T["admin.sidebar.forum-rubriques"],
      action: "navigate",
      routeHint: "/admin/forum/rubriques",
    },
    {
      id: "admin-forum-rubriques-2",
      message: "Ajoutez une rubrique.",
      target: T["admin.forum.rubriques.form"],
      action: "input",
      fillDemo: {
        [T["admin.forum.rubriques.form"]]: "Démonstration",
      },
    },
    {
      id: "admin-forum-rubriques-3",
      message: "Réordonnez par glisser-déposer.",
      target: T["admin.forum.rubriques.list"],
      action: "confirm",
    },
    {
      id: "admin-forum-rubriques-4",
      message: "Vérifiez l’ordre sur /forum.",
      target: T["nav.header.forum"],
      action: "navigate",
      routeHint: "/forum",
    },
  ],
};
