"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  userRole: "ADMIN" | "CONTRIBUTEUR";
};

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  adminOnly?: boolean;
};

const SIDEBAR_TOUR_IDS: Record<string, string> = {
  "/admin/articles": "admin.sidebar.articles",
  "/admin/documents": "admin.sidebar.documents",
  "/admin/categories": "admin.sidebar.categories",
  "/admin/projets": "admin.sidebar.projets",
  "/admin/utilisateurs": "admin.sidebar.utilisateurs",
  "/admin/forum": "admin.sidebar.forum",
  "/admin/forum/rubriques": "admin.sidebar.forum-rubriques",
  "/admin/forum/abonnements": "admin.sidebar.forum-abonnements",
  "/admin/profil": "admin.sidebar.profil",
  "/admin/aide": "admin.sidebar.aide",
  "/forum/nouveau": "forum.new-topic",
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Général",
    items: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/profil", label: "Mon profil" },
      { href: "/admin/aide", label: "Aide" },
    ],
  },
  {
    title: "Contenu",
    items: [
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/documents", label: "Documents" },
      { href: "/admin/projets", label: "Projets", adminOnly: true },
      { href: "/admin/categories", label: "Catégories", adminOnly: true },
    ],
  },
  {
    title: "Forum",
    items: [
      { href: "/forum", label: "Voir le forum", exact: true },
      { href: "/forum/nouveau", label: "Nouveau sujet" },
      { href: "/admin/forum/abonnements", label: "Abonnements\ndiscussions" },
      { href: "/admin/forum", label: "Modération", adminOnly: true, exact: true },
      { href: "/admin/forum/rubriques", label: "Rubriques", adminOnly: true },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/utilisateurs", label: "Utilisateurs", adminOnly: true },
    ],
  },
];

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.adminOnly || userRole === "ADMIN"),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:w-56 md:border-r md:border-b-0 md:min-h-[calc(100vh-4.5rem)]">
      <nav className="flex flex-col p-3" aria-label="Espace membre">
        {sections.map((section, index) => (
          <div
            key={section.title}
            className={cn(index > 0 && "mt-3 border-t border-gray-200 pt-3")}
          >
            <p className="mb-1.5 px-3 font-heading text-xs font-bold tracking-wide text-primary-dark">
              {section.title}
            </p>
            <div className="flex gap-0.5 overflow-x-auto md:flex-col md:overflow-visible">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour-id={SIDEBAR_TOUR_IDS[item.href]}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors md:whitespace-pre-line",
                      isActive
                        ? "bg-bg-soft text-accent-dark"
                        : "text-primary/65 hover:bg-gray-50 hover:text-primary-dark",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
