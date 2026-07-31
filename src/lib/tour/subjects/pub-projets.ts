import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubProjets: TourSubject = {
  id: "pub-projets",
  label: "Voir les projets & faire un don",
  description: "Découvrir les projets MEEED et le lien de don.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-documents", "pub-contact"],
  steps: [
    {
      id: "pub-projets-1",
      message: "Ouvrez la page Projets.",
      target: T["nav.header.projets"],
      action: "navigate",
      routeHint: "/projets",
    },
    {
      id: "pub-projets-2",
      message: "Chaque carte présente un projet MEEED.",
      target: T["projets.grid"],
      action: "confirm",
    },
    {
      id: "pub-projets-3",
      message: "Ouvrez un projet (si fiche détaillée).",
      target: T["projets.card"],
      action: "click",
      fallbackMessage: "Aucun projet affiché : créez-en un via le parcours admin projets.",
    },
    {
      id: "pub-projets-4",
      message: "Un lien de don peut renvoyer vers HelloAsso.",
      target: T["projets.donate"],
      action: "confirm",
      optional: true,
      fallbackMessage: "Pas de lien de don sur ce projet : vous pouvez passer.",
    },
  ],
};
