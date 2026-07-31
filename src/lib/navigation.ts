import type { NavLink } from "@/types";

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Articles", group: "Contenus" },
  { href: "/categories", label: "Catégories", group: "Contenus" },
  { href: "/documents", label: "Documents", group: "Contenus" },
  { href: "/forum", label: "Forum", group: "Communaute" },
  { href: "/projets", label: "Projets", group: "Initiatives" },
  { href: "/a-propos", label: "À propos", group: "Association" },
  { href: "/contact", label: "Contact", group: "Association" },
  { href: "/don", label: "Faire un don", group: "Soutien" },
];
