"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", match: "accueil" as const },
  { href: "/actualites", label: "Articles", match: "articles" as const },
  { href: "/categories", label: "Domaines", match: "domaines" as const },
  { href: "/documents", label: "Documents", match: "documents" as const },
  { href: "/forum", label: "Forum", match: "forum" as const },
] as const;

function isNavItemActive(
  match: (typeof NAV_ITEMS)[number]["match"],
  pathname: string,
  contentType: string | null,
) {
  if (match === "accueil") {
    return pathname === "/";
  }

  if (match === "forum") {
    return pathname === "/forum" || pathname.startsWith("/forum/");
  }

  if (match === "domaines") {
    return (
      pathname === "/categories" ||
      pathname.startsWith("/categories/") ||
      pathname.startsWith("/c/")
    );
  }

  if (match === "documents") {
    return pathname === "/documents" || pathname.startsWith("/documents/");
  }

  return (
    (pathname === "/actualites" &&
      contentType !== "news" &&
      contentType !== "domain" &&
      contentType !== "formation") ||
    pathname.startsWith("/a/")
  );
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const contentType = searchParams.get("type");

  const tourIdByMatch: Record<(typeof NAV_ITEMS)[number]["match"], string | undefined> = {
    accueil: undefined,
    articles: "nav.header.articles",
    domaines: "nav.header.domaines",
    documents: "nav.header.documents",
    forum: "nav.header.forum",
  };

  return (
    <nav
      aria-label="Navigation principale"
      data-tour-id="nav.header.root"
      className="absolute left-1/2 hidden -translate-x-1/2 md:block"
    >
      <ul className="flex items-center gap-1 rounded-full border border-primary/10 bg-white/70 p-1 shadow-sm backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(item.match, pathname, contentType);
          const tourId = tourIdByMatch[item.match];

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-tour-id={tourId}
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
