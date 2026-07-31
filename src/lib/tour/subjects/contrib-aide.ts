import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribAide: TourSubject = {
  id: "contrib-aide",
  label: "Ouvrir l’aide intégrée",
  description: "Rechercher et ouvrir une fiche d’aide.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-publier-article", "contrib-dashboard"],
  steps: [
    {
      id: "contrib-aide-1",
      message: "Ouvrez Aide dans le menu.",
      target: T["admin.sidebar.aide"],
      action: "navigate",
      routeHint: "/admin/aide",
    },
    {
      id: "contrib-aide-2",
      message: "Recherchez une fiche (ex. « publier »).",
      target: T["admin.aide.search"],
      action: "input",
      fillDemo: { [T["admin.aide.search"]]: "publier" },
    },
    {
      id: "contrib-aide-3",
      message: "Ouvrez une fiche et suivez ses étapes.",
      target: T["admin.aide.card"],
      action: "confirm",
    },
  ],
};
