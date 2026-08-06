import type { TourAudience, TourSubject } from "@/lib/tour/types";
import { adminCategories } from "./admin-categories";
import { adminDocSensible } from "./admin-doc-sensible";
import { adminForumEpingler } from "./admin-forum-epingler";
import { adminForumModeration } from "./admin-forum-moderation";
import { adminForumRubriques } from "./admin-forum-rubriques";
import { adminTousArticles } from "./admin-tous-articles";
import { adminUtilisateurs } from "./admin-utilisateurs";
import { contribAide } from "./contrib-aide";
import { contribArchiver } from "./contrib-archiver";
import { contribBrouillon } from "./contrib-brouillon";
import { contribDashboard } from "./contrib-dashboard";
import { contribDocument } from "./contrib-document";
import { contribEditeur } from "./contrib-editeur";
import { contribForumAbonnement } from "./contrib-forum-abonnement";
import { contribForumRepondre } from "./contrib-forum-repondre";
import { contribForumSujet } from "./contrib-forum-sujet";
import { contribLierForum } from "./contrib-lier-forum";
import { contribLogin } from "./contrib-login";
import { contribMdpOublie } from "./contrib-mdp-oublie";
import { contribProfil } from "./contrib-profil";
import { contribPublierArticle } from "./contrib-publier-article";
import { contribVisibiliteDoc } from "./contrib-visibilite-doc";
import { pubAccueil } from "./pub-accueil";
import { pubArticles } from "./pub-articles";
import { pubCategories } from "./pub-categories";
import { pubConnexion } from "./pub-connexion";
import { pubContact } from "./pub-contact";
import { pubDocuments } from "./pub-documents";
import { pubForumLire } from "./pub-forum-lire";
import { pubForumRecherche } from "./pub-forum-recherche";
import { pubLireArticle } from "./pub-lire-article";

/** Catalogue des sujets du tutoriel interactif. */
export const ALL_SUBJECTS: TourSubject[] = [
  // Visiteur
  pubAccueil,
  pubArticles,
  pubLireArticle,
  pubCategories,
  pubDocuments,
  pubForumLire,
  pubForumRecherche,
  pubContact,
  pubConnexion,
  // Contributeur
  contribLogin,
  contribDashboard,
  contribPublierArticle,
  contribBrouillon,
  contribEditeur,
  contribLierForum,
  contribArchiver,
  contribDocument,
  contribVisibiliteDoc,
  contribForumSujet,
  contribForumRepondre,
  contribForumAbonnement,
  contribProfil,
  contribMdpOublie,
  contribAide,
  // Admin
  adminTousArticles,
  adminCategories,
  adminUtilisateurs,
  adminForumRubriques,
  adminForumModeration,
  adminForumEpingler,
  adminDocSensible,
];

export function getSubjectById(id: string): TourSubject | undefined {
  return ALL_SUBJECTS.find((s) => s.id === id);
}

export function getSubjectsForAudience(audience: TourAudience): TourSubject[] {
  if (audience === "VISITOR") {
    return ALL_SUBJECTS.filter((s) => s.id.startsWith("pub-"));
  }
  if (audience === "CONTRIBUTEUR") {
    return ALL_SUBJECTS.filter((s) => s.id.startsWith("contrib-"));
  }
  // Admin : sujets contributeur + admin (§2.4)
  return ALL_SUBJECTS.filter(
    (s) => s.id.startsWith("contrib-") || s.id.startsWith("admin-"),
  );
}

/** Ordre de la chaîne « Démo complète » (§7 tutoriel). */
export const DEMO_CHAIN_IDS: string[] = [
  "pub-accueil",
  "pub-lire-article",
  "pub-documents",
  "pub-forum-lire",
  "pub-connexion",
  "contrib-dashboard",
  "contrib-publier-article",
  "contrib-lier-forum",
  "contrib-document",
  "contrib-forum-sujet",
  "contrib-forum-repondre",
  "admin-categories",
  "admin-forum-moderation",
];

/** Raccourcis contexte : pathname → subjectIds. */
export const CONTEXT_SUBJECTS: Record<string, string[]> = {
  "/": ["pub-accueil", "pub-articles", "pub-lire-article"],
  "/actualites": ["pub-articles", "pub-lire-article", "pub-categories"],
  "/documents": ["pub-documents", "contrib-document"],
  "/forum": ["pub-forum-lire", "pub-forum-recherche", "contrib-forum-sujet"],
  "/contact": ["pub-contact"],
  "/admin": ["contrib-dashboard", "contrib-publier-article"],
  "/admin/articles": ["contrib-publier-article", "contrib-brouillon", "admin-tous-articles"],
  "/admin/documents": ["contrib-document", "contrib-visibilite-doc", "admin-doc-sensible"],
  "/admin/documents/nouveau": ["contrib-document", "admin-doc-sensible"],
  "/admin/categories": ["admin-categories"],
  "/admin/utilisateurs": ["admin-utilisateurs"],
  "/admin/forum": ["admin-forum-moderation", "admin-forum-rubriques"],
};

export function getContextSubjectIds(pathname: string): string[] {
  if (CONTEXT_SUBJECTS[pathname]) return CONTEXT_SUBJECTS[pathname];
  const prefix = Object.keys(CONTEXT_SUBJECTS)
    .filter((k) => k !== "/" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? CONTEXT_SUBJECTS[prefix] : [];
}
