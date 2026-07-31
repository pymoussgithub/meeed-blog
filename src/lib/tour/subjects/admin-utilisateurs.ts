import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminUtilisateurs: TourSubject = {
  id: "admin-utilisateurs",
  label: "Inviter / gérer un utilisateur",
  description: "Créer un compte et gérer rôles ou statut.",
  audience: ["ADMIN"],
  nextSuggested: ["admin-forum-rubriques", "contrib-login"],
  steps: [
    {
      id: "admin-utilisateurs-1",
      message: "Ouvrez Utilisateurs.",
      target: T["admin.sidebar.utilisateurs"],
      action: "navigate",
      routeHint: "/admin/utilisateurs",
    },
    {
      id: "admin-utilisateurs-2",
      message: "Créez un compte (e-mail, rôle Contributeur).",
      target: T["admin.utilisateurs.form"],
      action: "input",
      fillDemo: {
        [T["admin.utilisateurs.form"]]: "nouveau@meeed.demo",
      },
    },
    {
      id: "admin-utilisateurs-3",
      message: "Changez un rôle ou activez / désactivez un compte.",
      target: T["admin.utilisateurs.list"],
      action: "confirm",
    },
    {
      id: "admin-utilisateurs-4",
      message: "Déclenchez une réinitialisation de mot de passe si besoin.",
      target: T["admin.utilisateurs.list"],
      action: "confirm",
      optional: true,
    },
  ],
};
