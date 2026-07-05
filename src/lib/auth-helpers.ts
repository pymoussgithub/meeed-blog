import { auth } from "@/lib/auth";

export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: "ADMIN" | "CONTRIBUTEUR";
};

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
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
