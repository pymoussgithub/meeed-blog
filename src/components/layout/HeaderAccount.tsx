"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navButtonClass =
  "rounded-full border-2 border-accent px-4 py-1.5 text-sm font-medium text-accent-dark transition-colors hover:bg-accent hover:text-white";

type SessionPayload = {
  user?: { id?: string } | null;
};

/**
 * Résout l'état de connexion côté client pour ne pas forcer
 * un rendu dynamique (cookies) sur toutes les pages publiques.
 */
export function HeaderAccount() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((session: SessionPayload | null) => {
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

  const accountHref = isLoggedIn ? "/admin" : "/admin/login";
  const accountLabel = isLoggedIn ? "Mon compte" : "Se connecter";

  return (
    <Link
      href={accountHref}
      className={navButtonClass}
      data-tour-id="nav.header.login"
      aria-busy={isLoggedIn === null}
    >
      {accountLabel}
    </Link>
  );
}
