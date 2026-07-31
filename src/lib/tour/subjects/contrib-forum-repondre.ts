import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribForumRepondre: TourSubject = {
  id: "contrib-forum-repondre",
  label: "Répondre à une discussion",
  description: "Publier une réponse dans un sujet ouvert.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-forum-abonnement", "contrib-forum-sujet"],
  steps: [
    {
      id: "contrib-forum-repondre-1",
      message: "Ouvrez un sujet ouvert.",
      target: T["forum.topic.row"],
      action: "navigate",
      routeHint: "/forum/s/",
      fallbackMessage: "Sujet verrouillé : choisissez un autre sujet ou demandez un déverrouillage admin.",
    },
    {
      id: "contrib-forum-repondre-2",
      message: "Rédigez une réponse en bas de page.",
      target: T["forum.reply.form"],
      action: "input",
      fillDemo: {
        [T["forum.reply.form"]]: "Réponse de démonstration pour le tutoriel MEEED.",
      },
    },
    {
      id: "contrib-forum-repondre-3",
      message: "Publiez.",
      target: T["forum.reply.submit"],
      action: "success",
    },
    {
      id: "contrib-forum-repondre-4",
      message: "Votre message apparaît dans le fil.",
      target: T["forum.reply.form"],
      action: "confirm",
    },
  ],
};
