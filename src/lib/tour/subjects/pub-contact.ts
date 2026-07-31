import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubContact: TourSubject = {
  id: "pub-contact",
  label: "Contacter l’association",
  description: "Trouver le moyen de contact affiché.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-connexion", "pub-accueil"],
  steps: [
    {
      id: "pub-contact-1",
      message: "Ouvrez le menu déroulant.",
      target: T["nav.header.menu"],
      action: "click",
      fallbackMessage: "Sur mobile, ouvrez le menu hamburger en haut à droite.",
    },
    {
      id: "pub-contact-2",
      message: "Cliquez sur « Contact ».",
      target: T["nav.header.contact"],
      action: "navigate",
      routeHint: "/contact",
    },
    {
      id: "pub-contact-3",
      message: "Utilisez le moyen de contact affiché (mail).",
      target: T["contact.mailto"],
      action: "confirm",
    },
  ],
};
