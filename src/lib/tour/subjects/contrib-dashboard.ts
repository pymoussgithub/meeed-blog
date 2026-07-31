import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribDashboard: TourSubject = {
  id: "contrib-dashboard",
  label: "Comprendre le tableau de bord",
  description: "Compteurs, filtres et contenus récents de l’espace membre.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-publier-article", "contrib-brouillon"],
  steps: [
    {
      id: "contrib-dashboard-1",
      message: "Voici votre dashboard.",
      target: T["admin.dashboard.stats"],
      action: "confirm",
      routeHint: "/admin",
    },
    {
      id: "contrib-dashboard-2",
      message: "Les compteurs résument publiés, brouillons, archivés, documents.",
      target: T["admin.dashboard.stats"],
      action: "confirm",
    },
    {
      id: "contrib-dashboard-3",
      message: "Cliquez sur un compteur pour filtrer.",
      target: T["admin.dashboard.stat-card"],
      action: "click",
      routeHint: "/admin",
    },
    {
      id: "contrib-dashboard-4",
      message: "L’onglet Récents montre vos derniers contenus.",
      target: T["admin.dashboard.recents"],
      action: "confirm",
      optional: true,
      fallbackMessage: "L’onglet Récents est sous les compteurs du dashboard.",
    },
  ],
};
