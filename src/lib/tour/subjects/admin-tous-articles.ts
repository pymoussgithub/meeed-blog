import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const adminTousArticles: TourSubject = {
  id: "admin-tous-articles",
  label: "Gérer tous les articles",
  description: "Voir et éditer les articles de tous les auteurs.",
  audience: ["ADMIN"],
  nextSuggested: ["admin-categories", "contrib-archiver"],
  steps: [
    {
      id: "admin-tous-articles-1",
      message: "En admin, la liste Articles montre tous les auteurs.",
      target: T["admin.articles.list"],
      action: "confirm",
      routeHint: "/admin/articles",
    },
    {
      id: "admin-tous-articles-2",
      message: "Filtrez par statut, catégorie ou recherche.",
      target: T["admin.articles.filters"],
      action: "confirm",
    },
    {
      id: "admin-tous-articles-3",
      message: "Ouvrez l’article d’un autre auteur et éditez-le.",
      target: T["admin.articles.list"],
      action: "navigate",
      routeHint: "/admin/articles/",
    },
  ],
};
