import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribForumSujet: TourSubject = {
  id: "contrib-forum-sujet",
  label: "Créer un sujet forum",
  description: "Publier une nouvelle discussion dans une rubrique.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-forum-repondre", "contrib-forum-abonnement"],
  steps: [
    {
      id: "contrib-forum-sujet-1",
      message: "Cliquez sur « Nouveau sujet ».",
      target: T["forum.new-topic"],
      action: "navigate",
      routeHint: "/forum/nouveau",
    },
    {
      id: "contrib-forum-sujet-2",
      message: "Choisissez une rubrique.",
      target: T["forum.topic.rubrique"],
      action: "input",
      fallbackMessage: "Aucune rubrique : créez-en une via le parcours admin rubriques.",
    },
    {
      id: "contrib-forum-sujet-3",
      message: "Donnez un titre clair.",
      target: T["forum.topic.title"],
      action: "input",
      fillDemo: { [T["forum.topic.title"]]: "Sujet tutoriel démo" },
    },
    {
      id: "contrib-forum-sujet-4",
      message: "Rédigez le message initial.",
      target: T["forum.topic.body"],
      action: "input",
      fillDemo: {
        [T["forum.topic.body"]]: "Message initial de démonstration pour le parcours tutoriel MEEED.",
      },
    },
    {
      id: "contrib-forum-sujet-5",
      message: "Publiez le sujet.",
      target: T["forum.topic.publish"],
      action: "success",
      routeHint: "/forum/s/",
    },
    {
      id: "contrib-forum-sujet-6",
      message: "Le sujet apparaît dans sa rubrique.",
      target: T["forum.topic.row"],
      action: "confirm",
    },
  ],
};
