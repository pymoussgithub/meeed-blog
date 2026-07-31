import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminProjets: TourSubject = {
  id: "admin-projets",
  label: "Créer un projet",
  description: "Renseigner et publier un projet MEEED.",
  audience: ["ADMIN"],
  nextSuggested: ["pub-projets", "admin-categories"],
  steps: [
    {
      id: "admin-projets-1",
      message: "Ouvrez Projets → Nouveau projet.",
      target: T["admin.projets.new-button"],
      action: "navigate",
      routeHint: "/admin/projets/nouveau",
    },
    {
      id: "admin-projets-2",
      message: "Renseignez titre, résumé, description.",
      target: T["admin.projets.form"],
      action: "input",
      fillDemo: {
        [T["admin.projets.form"]]: "Projet tutoriel démo",
      },
    },
    {
      id: "admin-projets-3",
      message: "Ajoutez une couverture et une catégorie.",
      target: T["admin.projets.form"],
      action: "confirm",
      optional: true,
    },
    {
      id: "admin-projets-4",
      message: "Ajoutez un lien de don HelloAsso si besoin, activez le projet.",
      target: T["admin.projets.form"],
      action: "confirm",
      optional: true,
    },
    {
      id: "admin-projets-5",
      message: "Enregistrez.",
      target: T["admin.projets.save"],
      action: "confirm",
    },
    {
      id: "admin-projets-6",
      message: "Réordonnez dans le tableau, puis vérifiez /projets.",
      target: T["nav.header.projets"],
      action: "confirm",
    },
  ],
};
