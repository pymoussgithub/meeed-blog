import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribDocument: TourSubject = {
  id: "contrib-document",
  label: "Ajouter un document PDF",
  description: "Uploader un PDF et le rendre visible selon la visibilité choisie.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-visibilite-doc", "pub-documents"],
  steps: [
    {
      id: "contrib-document-1",
      message: "Ouvrez Documents dans le menu.",
      target: T["admin.sidebar.documents"],
      action: "navigate",
      routeHint: "/admin/documents",
    },
    {
      id: "contrib-document-2",
      message: "Cliquez sur « Nouveau document ».",
      target: T["admin.documents.new-button"],
      action: "navigate",
      routeHint: "/admin/documents/nouveau",
    },
    {
      id: "contrib-document-3",
      message: "Renseignez le titre.",
      target: T["admin.documents.title"],
      action: "input",
      fillDemo: { [T["admin.documents.title"]]: "Guide démo PDF" },
    },
    {
      id: "contrib-document-4",
      message: "Choisissez la visibilité (ex. Tout le monde).",
      target: T["admin.documents.visibility"],
      action: "input",
    },
    {
      id: "contrib-document-5",
      message: "Sélectionnez un PDF (max 25 Mo) et validez.",
      target: T["admin.documents.upload"],
      action: "confirm",
      fallbackMessage: "Utilisez un PDF d’exemple (guide-demo.pdf) si disponible.",
    },
    {
      id: "contrib-document-6",
      message: "Liez-le éventuellement à un article ou un projet.",
      target: T["admin.documents.list"],
      action: "confirm",
      optional: true,
    },
    {
      id: "contrib-document-7",
      message: "Vérifiez-le sur la bibliothèque publique si public.",
      target: T["nav.header.documents"],
      action: "navigate",
      routeHint: "/documents",
      optional: true,
    },
  ],
};
