import { auth } from "@/lib/auth";
import { credentialsSignature } from "@/lib/credentials-signature";
import { prisma } from "@/lib/prisma";

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "CONTRIBUTEUR";
};

/** Relit la BDD à chaque appel : rôle, isActive et empreinte MDP (sessions invalidées). */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!dbUser || !dbUser.isActive) {
    return null;
  }

  const expected = credentialsSignature(dbUser.passwordHash);
  if (session.user.credentialsVersion !== expected) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Non autorisé");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs");
  }
  return user;
}

export type UploadAuthContext = {
  userId: string;
  role: "ADMIN" | "CONTRIBUTEUR";
};

export async function requireUploadAuth(): Promise<UploadAuthContext | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return { userId: user.id, role: user.role };
}
