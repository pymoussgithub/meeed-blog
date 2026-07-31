import { TOUR_TARGETS as T } from "@/lib/tour/targets";
import type { TourSubject } from "@/lib/tour/types";

export const pubLireArticle: TourSubject = {
  id: "pub-lire-article",
  label: "Lire et partager un article",
  description: "Page article, documents liés et partage.",
  audience: ["VISITOR", "CONTRIBUTEUR", "ADMIN"],
  nextSuggested: ["pub-forum-lire", "pub-documents"],
  steps: [
    {
      id: "pub-lire-article-1",
      message: "Ouvrez un article publié.",
      target: T["articles.list.card"],
      action: "navigate",
      routeHint: "/a/",
      fallbackMessage: "Aucun article visible. Ouvrez Actualités ou créez un article démo.",
    },
    {
      id: "pub-lire-article-2",
      message: "Titre, métadonnées et couverture.",
      target: T["article.header"],
      action: "confirm",
    },
    {
      id: "pub-lire-article-3",
      message: "Faites défiler le contenu.",
      target: T["article.body"],
      action: "confirm",
    },
    {
      id: "pub-lire-article-4",
      message: "S’il y a des PDF liés, consultez-en un.",
      target: T["article.documents"],
      action: "confirm",
      optional: true,
      fallbackMessage: "Aucun document lié : passez à l’étape suivante.",
    },
    {
      id: "pub-lire-article-5",
      message: "Partagez via la barre de partage (copie du lien).",
      target: T["article.share.copy-link"],
      action: "click",
    },
    {
      id: "pub-lire-article-6",
      message: "Si des discussions forum sont liées, ouvrez-en une.",
      target: T["article.linked-topics"],
      action: "confirm",
      optional: true,
      fallbackMessage: "Aucune discussion liée : vous pourrez en ajouter via le parcours contributeur.",
    },
  ],
};
