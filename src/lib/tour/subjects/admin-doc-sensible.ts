import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminDocSensible: TourSubject = {
  id: "admin-doc-sensible",
  label: "Document réservé aux admins",
  description: "Restreindre un PDF aux administrateurs uniquement.",
  audience: ["ADMIN"],
  nextSuggested: ["contrib-visibilite-doc", "contrib-document"],
  steps: [
    {
      id: "admin-doc-sensible-1",
      message: "Ouvrez Documents dans le menu.",
      target: T["admin.sidebar.documents"],
      action: "navigate",
      routeHint: "/admin/documents",
    },
    {
      id: "admin-doc-sensible-2",
      message: "Cliquez sur « Nouveau document » pour uploader, ou éditez un existant.",
      target: T["admin.documents.new-button"],
      action: "navigate",
      routeHint: "/admin/documents/nouveau",
    },
    {
      id: "admin-doc-sensible-3",
      message: "Choisissez « Admins uniquement ».",
      target: T["admin.documents.visibility"],
      action: "input",
    },
    {
      id: "admin-doc-sensible-4",
      message: "Enregistrez : invisible aux contributeurs et anonymes.",
      target: T["admin.documents.upload"],
      action: "confirm",
    },
  ],
};
