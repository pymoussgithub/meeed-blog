"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavLink } from "@/types";

type MobileMenuProps = {
  links: NavLink[];
  isLoggedIn?: boolean;
};

export function MobileMenu({ links, isLoggedIn = false }: MobileMenuProps) {
  const accountHref = isLoggedIn ? "/admin" : "/admin/login";
  const accountLabel = isLoggedIn ? "Mon compte" : "Se connecter";
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="rounded-lg p-2 text-primary hover:bg-gray-100"
        onClick={() => setOpen((value) => !value)}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          className="absolute left-0 right-0 top-16 border-b border-gray-200 bg-white px-4 py-4 shadow-lg"
          aria-label="Navigation mobile"
        >
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-bg-soft"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={accountHref}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-accent-dark hover:bg-bg-soft"
                onClick={() => setOpen(false)}
              >
                {accountLabel}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
