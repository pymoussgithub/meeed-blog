"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { NavLink } from "@/types";

type MobileMenuProps = {
  links: NavLink[];
};

const MOBILE_TOUR_IDS: Record<string, string> = {
  "/actualites": "nav.header.articles",
  "/documents": "nav.header.documents",
  "/forum": "nav.header.forum",
  "/categories": "nav.header.domaines",
  "/contact": "nav.header.contact",
};

export function MobileMenu({ links }: MobileMenuProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const accountHref = isLoggedIn ? "/admin" : "/admin/login";
  const accountLabel = isLoggedIn ? "Mon compte" : "Se connecter";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const groupedLinks = links.reduce<Array<{ title: string | null; links: NavLink[] }>>((groups, link) => {
    const title = link.group ?? null;
    const existingGroup = groups.find((group) => group.title === title);

    if (existingGroup) {
      existingGroup.links.push(link);
      return groups;
    }

    groups.push({ title, links: [link] });
    return groups;
  }, []);
  const featuredLinks = groupedLinks.find((group) => group.title === null)?.links ?? [];
  const sectionGroups = groupedLinks.filter((group) => group.title !== null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((session: { user?: { id?: string } | null } | null) => {
        if (!cancelled) {
          setIsLoggedIn(Boolean(session?.user?.id));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLoggedIn(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panel =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Fermer le menu"
              className="fixed inset-0 top-16 z-50 bg-primary/20 backdrop-blur-[2px] sm:top-20 md:hidden"
              onClick={() => setOpen(false)}
            />

            <nav
              id="mobile-menu"
              className="fixed inset-x-0 top-16 bottom-0 z-[60] border-t border-white/60 bg-white/92 px-4 py-4 shadow-xl backdrop-blur sm:top-20 md:hidden"
              aria-label="Navigation mobile"
            >
              <div className="mx-auto max-h-full max-w-lg overflow-y-auto pb-6">
                <div className="mb-4 flex items-center justify-between rounded-3xl bg-gradient-to-br from-bg-soft via-white to-accent/10 px-4 py-4 shadow-sm ring-1 ring-white/70">
                  <div>
                    <p className="text-sm font-semibold text-primary">Navigation</p>
                    <p className="text-xs text-primary/55">Accès rapide aux rubriques</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-primary/60 transition-colors hover:bg-white hover:text-accent-dark"
                    onClick={() => setOpen(false)}
                    aria-label="Fermer le menu"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {featuredLinks.length > 0 ? (
                  <div className="mb-4 rounded-2xl bg-bg-soft/80 p-2">
                    <ul className="space-y-1">
                      {featuredLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/5 transition-colors hover:text-accent-dark"
                            data-tour-id={MOBILE_TOUR_IDS[link.href]}
                            onClick={() => setOpen(false)}
                          >
                            <span>{link.label}</span>
                            <span aria-hidden className="text-primary/30">
                              /
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="space-y-4">
                  {sectionGroups.map((group) => (
                    <section key={group.title}>
                      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-dark/80">
                        {group.title}
                      </p>
                      <ul className="space-y-1 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-primary/8">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-bg-soft hover:text-accent-dark"
                              data-tour-id={MOBILE_TOUR_IDS[link.href]}
                              onClick={() => setOpen(false)}
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <Link
                  href={accountHref}
                  className="mt-5 block rounded-2xl border border-accent/30 bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                  data-tour-id="nav.header.login"
                  onClick={() => setOpen(false)}
                >
                  {accountLabel}
                </Link>
              </div>
            </nav>
          </>,
          document.body,
        )
      : null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        data-tour-id="nav.header.menu"
        className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-4 py-1.5 text-sm font-medium text-accent-dark transition-colors hover:bg-accent hover:text-white"
        onClick={() => setOpen((value) => !value)}
      >
        <span>Menu</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {panel}
    </div>
  );
}
