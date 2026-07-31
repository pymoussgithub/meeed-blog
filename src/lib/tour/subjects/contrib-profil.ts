import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribProfil: TourSubject = {
  id: "contrib-profil",
  label: "Gérer mon profil / mot de passe",
  description: "Modifier le nom affiché et le mot de passe.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-mdp-oublie", "contrib-aide"],
  steps: [
    {
      id: "contrib-profil-1",
      message: "Ouvrez Mon profil.",
      target: T["admin.sidebar.profil"],
      action: "navigate",
      routeHint: "/admin/profil",
    },
    {
      id: "contrib-profil-2",
      message: "Modifiez le nom affiché et enregistrez.",
      target: T["admin.profil.name"],
      action: "input",
      fillDemo: { [T["admin.profil.name"]]: "Contributeur Démo" },
    },
    {
      id: "contrib-profil-3",
      message: "Enregistrez les modifications du profil.",
      target: T["admin.profil.save"],
      action: "confirm",
    },
    {
      id: "contrib-profil-4",
      message: "(Optionnel) Changez le mot de passe.",
      target: T["admin.profil.password"],
      action: "confirm",
      optional: true,
    },
  ],
};
