import { NextResponse } from "next/server";
import { middlewareAuth } from "@/lib/auth.middleware";
import { sanitizeInternalPath } from "@/lib/safe-redirect";

export default middlewareAuth((request) => {
  const { pathname, search } = request.nextUrl;
  const isLoggedIn = Boolean(request.auth);
  const isLoginPage = pathname === "/admin/login";
  const isForumAccessPage = pathname === "/forum/acces";
  const isForumRoute = pathname === "/forum" || pathname.startsWith("/forum/");

  // Ne pas renvoyer automatiquement /admin/login → /admin quand un JWT est
  // présent : getCurrentUser peut le rejeter (layout admin). La page login
  // gère déjà la redirection post-connexion côté client.
  if (isLoginPage) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isForumRoute && !isForumAccessPage && !isLoggedIn) {
    const accessUrl = new URL("/forum/acces", request.url);
    accessUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(accessUrl);
  }

  if (isForumAccessPage && isLoggedIn) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const destination = sanitizeInternalPath(callbackUrl, "/forum");
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/upload/:path*", "/forum", "/forum/:path*"],
};
