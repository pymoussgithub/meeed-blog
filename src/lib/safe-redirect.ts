/**
 * N'accepte que des chemins relatifs internes (anti open-redirect).
 * Rejette aussi les pages d'auth pour éviter les boucles de redirection.
 */
export function sanitizeInternalPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  if (value.includes("://")) return fallback;
  if (value.includes("\\")) return fallback;

  const pathOnly = value.split("?")[0]?.split("#")[0] ?? value;
  if (pathOnly === "/forum/acces" || pathOnly === "/admin/login") {
    return fallback;
  }

  return value;
}
