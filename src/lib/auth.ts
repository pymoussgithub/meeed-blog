import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";
import { credentialsSignature } from "@/lib/credentials-signature";
import { isDevAccountSwitcherEnabled } from "@/lib/dev-mode";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  devSwitchUserId: z.string().min(1).optional(),
});

/** Fréquence max de relecture BDD dans le JWT (middleware reste edge-safe sans Prisma). */
const JWT_USER_REFRESH_MS = 60_000;

function clearAuthToken(token: Record<string, unknown>) {
  return {
    ...token,
    id: undefined,
    role: undefined,
    name: undefined,
    email: undefined,
    sub: undefined,
    credentialsVersion: undefined,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password, devSwitchUserId } = parsed.data;

        if (devSwitchUserId) {
          if (!isDevAccountSwitcherEnabled()) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { id: devSwitchUserId },
          });

          if (!user || !user.isActive) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            credentialsVersion: credentialsSignature(user.passwordHash),
          };
        }

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          credentialsVersion: credentialsSignature(user.passwordHash),
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.credentialsVersion = user.credentialsVersion;
        token.lastCheckedAt = Date.now();
        return token;
      }

      if (!token.id) {
        return token;
      }

      const lastCheckedAt =
        typeof token.lastCheckedAt === "number" ? token.lastCheckedAt : 0;
      if (Date.now() - lastCheckedAt < JWT_USER_REFRESH_MS) {
        return token;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: {
          id: true,
          role: true,
          isActive: true,
          name: true,
          email: true,
          passwordHash: true,
        },
      });

      token.lastCheckedAt = Date.now();

      if (!dbUser || !dbUser.isActive) {
        return clearAuthToken(token);
      }

      const version = credentialsSignature(dbUser.passwordHash);
      if (token.credentialsVersion !== version) {
        return clearAuthToken(token);
      }

      token.role = dbUser.role;
      token.name = dbUser.name;
      token.email = dbUser.email;
      token.credentialsVersion = version;
      return token;
    },
    async session({ session, token }) {
      if (!token.id || !token.role || !token.credentialsVersion) {
        return { ...session, user: undefined as unknown as typeof session.user };
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "CONTRIBUTEUR";
        session.user.credentialsVersion = token.credentialsVersion as string;
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
});
