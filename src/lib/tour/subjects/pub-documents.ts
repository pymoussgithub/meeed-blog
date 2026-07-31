import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubDocuments: TourSubject = {
  id: "pub-documents",
  label: "Consulter / télécharger un PDF",
  description: "Bibliothèque documents : recherche, lecture et téléchargement.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-connexion", "contrib-document"],
  steps: [
    {
      id: "pub-documents-1",
      message: "Ouvrez la bibliothèque Documents.",
      target: T["nav.header.documents"],
      action: "navigate",
      routeHint: "/documents",
    },
    {
      id: "pub-documents-2",
      message: "Ouvrez la recherche avancée pour filtrer les PDF.",
      target: T["documents.toolbar"],
      action: "click",
    },
    {
      id: "pub-documents-3",
      message:
        "Utilisez la recherche ou les filtres. Les documents restreints ne s’affichent pas pour un anonyme.",
      target: T["documents.filters.panel"],
      action: "confirm",
      fallbackMessage: "Ouvrez d’abord « Recherche avancée » via le bouton encadré.",
    },
    {
      id: "pub-documents-4",
      message:
        "Consultez un document public. Seuls les PDF et les images sont consultables en ligne ; les autres formats doivent être téléchargés sur votre PC.",
      target: T["documents.view"],
      action: "click",
      fallbackMessage: "Aucun document public consultable : connectez-vous ou ajoutez un fichier démo.",
    },
    {
      id: "pub-documents-5",
      message:
        "Téléchargez le fichier sur votre PC (obligatoire pour les formats autres que PDF et images).",
      target: T["documents.download"],
      action: "click",
    },
  ],
};
