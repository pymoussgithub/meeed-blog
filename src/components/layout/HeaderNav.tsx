"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", match: "accueil" as const },
  { href: "/actualites", label: "Nos articles", match: "articles" as const },
  { href: "/projets", label: "Nos projets", match: "projets" as const },
  { href: "/documents", label: "Documents", match: "documents" as const },
] as const;

function isNavItemActive(
  match: (typeof NAV_ITEMS)[number]["match"],
  pathname: string,
  contentType: string | null,
) {
  if (match === "accueil") {
    return pathname === "/";
  }

  if (match === "projets") {
    return pathname === "/projets" || pathname.startsWith("/projets/");
  }

  if (match === "documents") {
    return pathname === "/documents" || pathname.startsWith("/documents/");
  }

  return pathname === "/actualites" && contentType !== "news" && contentType !== "project";
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contentType = searchParams.get("type");

  return (
    <nav
      aria-label="Navigation principale"
      className="absolute left-1/2 hidden -translate-x-1/2 md:block"
    >
      <ul className="flex items-center gap-1 rounded-full border border-primary/10 bg-white/70 p-1 shadow-sm backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.match, pathname, contentType);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
                  active
                    ? "bg-accent text-white shadow-md shadow-accent/25"
                    : "text-primary/70 hover:bg-bg-soft hover:text-accent-dark",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
