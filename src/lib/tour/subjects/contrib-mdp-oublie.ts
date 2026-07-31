import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribMdpOublie: TourSubject = {
  id: "contrib-mdp-oublie",
  label: "Mot de passe oublié",
  description: "Demander une réinitialisation depuis l’écran de connexion.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-login", "contrib-profil"],
  steps: [
    {
      id: "contrib-mdp-oublie-1",
      message: "Depuis la connexion, cliquez sur « Mot de passe oublié ».",
      target: T["auth.forgot-password"],
      action: "navigate",
      routeHint: "/mot-de-passe-oublie",
    },
    {
      id: "contrib-mdp-oublie-2",
      message: "Saisissez l’e-mail du compte.",
      target: T["auth.forgot.email"],
      action: "input",
      fillDemo: { [T["auth.forgot.email"]]: "contributeur@meeed.demo" },
    },
    {
      id: "contrib-mdp-oublie-3",
      message: "Envoyez la demande : un e-mail de réinitialisation part.",
      target: T["auth.forgot.submit"],
      action: "confirm",
    },
    {
      id: "contrib-mdp-oublie-4",
      message: "Ouvrez le lien reçu (ou lien de démo) pour choisir un nouveau mot de passe.",
      target: T["auth.forgot.submit"],
      action: "navigate",
      routeHint: "/reinitialiser-mot-de-passe",
      optional: true,
      fallbackMessage: "En démo, ouvrez le lien de réinitialisation fourni ou passez cette étape.",
    },
  ],
};
