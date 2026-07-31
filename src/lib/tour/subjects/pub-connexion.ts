import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

const LOGIN_STEPS = [
  {
    id: "login-1",
    message: "Accédez à la connexion.",
    target: T["nav.header.login"],
    action: "navigate" as const,
    routeHint: "/admin/login",
    fallbackMessage: "Ouvrez /admin/login depuis le menu compte.",
  },
  {
    id: "login-2",
    message: "Saisissez votre adresse e-mail.",
    target: T["auth.login.email"],
    action: "input" as const,
    routeHint: "/admin/login",
    fillDemo: {
      [T["auth.login.email"]]: "contributeur@meeed.demo",
    },
  },
  {
    id: "login-3",
    message: "Saisissez votre mot de passe dans ce champ.",
    target: T["auth.login.password"],
    action: "input" as const,
    routeHint: "/admin/login",
    fillDemo: {
      [T["auth.login.password"]]: "demo-password",
    },
  },
  {
    id: "login-4",
    message:
      "Pas encore de compte ? Cliquez sur « Créer un compte » pour vous inscrire (nom, e-mail, mot de passe).",
    target: T["auth.login.register"],
    action: "confirm" as const,
    routeHint: "/admin/login",
  },
  {
    id: "login-5",
    message:
      "Mot de passe oublié ? Ce lien envoie un e-mail de récupération pour choisir un nouveau mot de passe.",
    target: T["auth.forgot-password"],
    action: "confirm" as const,
    routeHint: "/admin/login",
  },
  {
    id: "login-6",
    message:
      "Le lien « Retour au site » ramène à l’accueil public sans se connecter.",
    target: T["auth.login.back-home"],
    action: "confirm" as const,
    routeHint: "/admin/login",
  },
  {
    id: "login-7",
    message: "Quand vos identifiants sont prêts, cliquez sur « Se connecter » pour entrer dans l’espace membre.",
    target: T["auth.login.submit"],
    action: "success" as const,
    routeHint: "/admin",
  },
];

export const pubConnexion: TourSubject = {
  id: "pub-connexion",
  label: "Se connecter à l’espace membre",
  description: "Connexion, inscription, mot de passe oublié et retour au site.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-dashboard", "contrib-publier-article"],
  steps: LOGIN_STEPS.map((step) => ({
    ...step,
    id: `pub-connexion-${step.id.replace("login-", "")}`,
  })),
};
