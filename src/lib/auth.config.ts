import type { NextAuthConfig } from "next-auth";

const ADMIN_ONLY_PREFIXES = ["/admin/utilisateurs", "/admin/categories"];

export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = pathname === "/admin/login";

      if (isLoginPage) {
        return true;
      }

      if (pathname.startsWith("/admin") && !isLoggedIn) {
        return false;
      }

      if (
        isLoggedIn &&
        ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
        auth?.user?.role !== "ADMIN"
      ) {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }

      if (pathname.startsWith("/api/upload") && !isLoggedIn) {
        return Response.json({ error: "Non autorisé" }, { status: 401 });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CONTRIBUTEUR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
