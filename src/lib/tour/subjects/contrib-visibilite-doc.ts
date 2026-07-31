import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const contribVisibiliteDoc: TourSubject = {
  id: "contrib-visibilite-doc",
  label: "Choisir la visibilité d’un document",
  description: "Passer un PDF en accès contributeurs + admins.",
  audience: ["CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["contrib-document", "admin-doc-sensible"],
  steps: [
    {
      id: "contrib-visibilite-doc-1",
      message: "Ouvrez un document existant.",
      target: T["admin.documents.list"],
      action: "click",
      routeHint: "/admin/documents",
      fallbackMessage: "Ajoutez d’abord un document via le parcours PDF.",
    },
    {
      id: "contrib-visibilite-doc-2",
      message: "Trois niveaux : Tout le monde / Contributeurs+admins / Admins uniquement.",
      target: T["admin.documents.visibility"],
      action: "confirm",
    },
    {
      id: "contrib-visibilite-doc-3",
      message: "Passez en « Contributeurs + admins », enregistrez.",
      target: T["admin.documents.visibility"],
      action: "confirm",
    },
    {
      id: "contrib-visibilite-doc-4",
      message: "En navigation privée, le PDF disparaît de /documents.",
      target: T["admin.documents.list"],
      action: "confirm",
    },
  ],
};
