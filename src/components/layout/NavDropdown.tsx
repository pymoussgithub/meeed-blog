"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types";

type NavDropdownProps = {
  links: NavLink[];
};

const DROPDOWN_TOUR_IDS: Record<string, string> = {
  "/categories": "nav.header.domaines",
  "/contact": "nav.header.contact",
  "/actualites": "nav.header.articles",
  "/documents": "nav.header.documents",
  "/forum": "nav.header.forum",
};

export function NavDropdown({ links }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="nav-dropdown-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu de navigation"}
        data-tour-id="nav.header.menu"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border-2 border-accent px-4 py-1.5 text-sm font-medium text-accent-dark transition-colors",
          "hover:bg-accent hover:text-white",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          open && "bg-accent text-white",
        )}
        onClick={() => setOpen((value) => !value)}
      >
        Menu
        <svg
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          id="nav-dropdown-menu"
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-[23rem] max-w-[calc(100vw-2rem)] rounded-[28px] border border-primary/10 bg-white p-4 shadow-[0_24px_60px_rgba(13,42,62,0.12)] ring-1 ring-primary/5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-primary">Navigation</p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-primary/40">Menu rapide</p>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            {groupedLinks.map((group) => (
              <section key={group.title ?? "general"} className="min-w-0">
                <p className="mb-2 inline-flex rounded-full bg-accent/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-dark/75">
                  {group.title ?? "Principal"}
                </p>
                <ul className="space-y-0.5">
                  {group.links.map((link) => (
                    <li key={link.href} role="none">
                      <Link
                        href={link.href}
                        role="menuitem"
                        data-tour-id={DROPDOWN_TOUR_IDS[link.href]}
                        className={cn(
                          "block rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
                          "hover:bg-bg-soft hover:text-accent-dark hover:translate-x-0.5",
                          "text-primary/78",
                        )}
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
        </div>
      ) : null}
    </div>
  );
}
