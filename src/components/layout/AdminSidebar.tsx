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

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/documents", label: "Documents" },
  { href: "/admin/aide", label: "Aide" },
  { href: "/admin/profil", label: "Mon profil" },
  { href: "/admin/projets", label: "Projets", adminOnly: true },
  { href: "/admin/categories", label: "Catégories", adminOnly: true },
  { href: "/admin/utilisateurs", label: "Utilisateurs", adminOnly: true },
];

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || userRole === "ADMIN");

  return (
    <aside className="w-full shrink-0 border-b border-gray-200 bg-white md:w-56 md:border-r md:border-b-0 md:min-h-[calc(100vh-57px)]">
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible" aria-label="Administration">
        {items.map((item) => {
          const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-bg-soft text-accent-dark"
                  : "text-primary/70 hover:bg-gray-50 hover:text-primary-dark",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
