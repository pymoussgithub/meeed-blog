"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Destinations lourdes (auth + requêtes BDD) — articles inclus (toujours lents).
 * Catégories seules : assez rapides pour ne pas mériter l’overlay.
 */
function isSlowPath(pathname: string): boolean {
  if (pathname === "/documents" || pathname.startsWith("/documents/")) return true;
  if (pathname.startsWith("/a/")) return true;
  if (pathname === "/actualites" || pathname.startsWith("/actualites/")) return true;
  if (pathname === "/forum" || pathname.startsWith("/forum/")) return true;
  if (pathname === "/recherche" || pathname.startsWith("/recherche/")) return true;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") return true;
  return false;
}

function loadingMessage(pathname: string): string {
  if (pathname === "/documents" || pathname.startsWith("/documents/")) {
    return "Chargement des documents…";
  }
  if (pathname.startsWith("/a/")) {
    return "Chargement de l'article…";
  }
  if (pathname === "/actualites" || pathname.startsWith("/actualites/")) {
    return "Chargement des articles…";
  }
  if (pathname === "/forum" || pathname.startsWith("/forum/")) {
    return "Chargement du forum…";
  }
  if (pathname === "/recherche" || pathname.startsWith("/recherche/")) {
    return "Recherche en cours…";
  }
  if (pathname.startsWith("/admin")) {
    return "Chargement…";
  }
  return "Chargement…";
}

function locationFromHref(href: string): { pathname: string; search: string } | null {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return { pathname: url.pathname, search: url.search.startsWith("?") ? url.search.slice(1) : url.search };
  } catch {
    return null;
  }
}

const SAFETY_HIDE_MS = 20_000;

export function NavigationLoadingOverlay() {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Chargement…");
  const pathnameRef = useRef(pathname);
  const searchRef = useRef(searchParams?.toString() ?? "");
  const pendingPathRef = useRef<string | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  pathnameRef.current = pathname;
  searchRef.current = searchParams?.toString() ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimers = () => {
    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  };

  const hide = () => {
    pendingPathRef.current = null;
    clearTimers();
    setVisible(false);
  };

  // Fin de navigation soft (URL changée).
  useEffect(() => {
    pendingPathRef.current = null;
    clearTimers();
    setVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const startFor = (nextPath: string, nextSearch?: string) => {
      const currentPath = pathnameRef.current;
      const currentSearch = searchRef.current;
      const samePath = nextPath === currentPath;
      const sameSearch = nextSearch === undefined || nextSearch === currentSearch;
      if (samePath && sameSearch) return;
      if (!isSlowPath(nextPath)) return;

      pendingPathRef.current = nextPath;
      setMessage(loadingMessage(nextPath));
      clearTimers();
      setVisible(true);
      safetyTimerRef.current = setTimeout(() => {
        hide();
      }, SAFETY_HIDE_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.getAttribute("href")?.startsWith("#")) return;

      const next = locationFromHref(anchor.getAttribute("href") ?? anchor.href);
      if (!next) return;

      startFor(next.pathname, next.search);
    };

    // Boutons / router.push / router.replace (Next.js passe par l’History API).
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    const onHistoryWrite = (url: string | URL | null | undefined) => {
      if (url == null) return;
      const next = locationFromHref(String(url));
      if (!next) return;
      startFor(next.pathname, next.search);
    };

    window.history.pushState = (data, unused, url) => {
      onHistoryWrite(url);
      return originalPushState(data, unused, url);
    };
    window.history.replaceState = (data, unused, url) => {
      onHistoryWrite(url);
      return originalReplaceState(data, unused, url);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearTimers();
    };
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-busy="true"
      aria-live="assertive"
      aria-labelledby="nav-loading-title"
    >
      <div className="absolute inset-0 bg-primary/35 backdrop-blur-[2px]" />
      <div className="relative z-10 flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-gray-200 bg-white px-8 py-7 shadow-2xl">
        <Spinner size="lg" />
        <p id="nav-loading-title" className="text-center text-sm font-semibold text-primary-dark">
          {message}
        </p>
      </div>
    </div>,
    document.body,
  );
}
