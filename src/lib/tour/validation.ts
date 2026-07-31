/** Événement custom pour valider une étape `success` depuis les actions métier. */
export const TOUR_SUCCESS_EVENT = "meeed:tour-success";

export type TourSuccessDetail = {
  /** data-tour-id de la cible concernée, ou id d’étape. */
  target?: string;
  subjectId?: string;
};

export function emitTourSuccess(detail: TourSuccessDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOUR_SUCCESS_EVENT, { detail }));
}

export function matchRouteHint(pathname: string, routeHint?: string): boolean {
  if (!routeHint) return true;
  if (routeHint.endsWith("/")) {
    return pathname === routeHint.slice(0, -1) || pathname.startsWith(routeHint);
  }
  if (pathname === routeHint) return true;
  if (routeHint.includes("*")) {
    const re = new RegExp("^" + routeHint.replace(/\*/g, ".*") + "$");
    return re.test(pathname);
  }
  // Préfixe : /a/ matche /a/mon-slug
  if (routeHint.endsWith("/") === false && pathname.startsWith(routeHint + "/")) return true;
  return pathname.startsWith(routeHint) && (
    pathname.length === routeHint.length || pathname[routeHint.length] === "/" || pathname[routeHint.length] === "?"
  );
}

export function fillDemoFields(fillDemo: Record<string, string>): void {
  for (const [targetId, value] of Object.entries(fillDemo)) {
    const el = document.querySelector(`[data-tour-id="${targetId}"]`);
    if (!el) continue;

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      const proto =
        el instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      setter?.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      continue;
    }

    // Conteneur TipTap / contenteditable
    const editable = el.querySelector<HTMLElement>("[contenteditable='true']");
    if (editable) {
      editable.focus();
      editable.textContent = value;
      editable.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}
