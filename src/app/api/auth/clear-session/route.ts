import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { sanitizeInternalPath } from "@/lib/safe-redirect";

/**
 * Vide le cookie de session hors d'un Server Component.
 * Utilisé quand getCurrentUser() rejette un JWT encore présent
 * (MDP changé, compte inactif, session incomplète).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = sanitizeInternalPath(
    url.searchParams.get("callbackUrl"),
    "/admin/login",
  );

  await signOut({ redirect: false });

  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
