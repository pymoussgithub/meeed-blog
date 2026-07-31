import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminCategories: TourSubject = {
  id: "admin-categories",
  label: "Créer / ordonner les catégories",
  description: "Ajouter une catégorie et réordonner la liste.",
  audience: ["ADMIN"],
  nextSuggested: ["admin-projets", "pub-categories"],
  steps: [
    {
      id: "admin-categories-1",
      message: "Ouvrez Catégories.",
      target: T["admin.sidebar.categories"],
      action: "navigate",
      routeHint: "/admin/categories",
    },
    {
      id: "admin-categories-2",
      message: "Ajoutez une catégorie (nom, description, couleur).",
      target: T["admin.categories.form"],
      action: "input",
      fillDemo: {
        [T["admin.categories.form"]]: "Catégorie démo",
      },
    },
    {
      id: "admin-categories-3",
      message: "Réordonnez par glisser-déposer.",
      target: T["admin.categories.list"],
      action: "confirm",
    },
    {
      id: "admin-categories-4",
      message: "Vérifiez l’ordre sur le site public.",
      target: T["nav.header.categories"],
      action: "confirm",
      optional: true,
    },
  ],
};
