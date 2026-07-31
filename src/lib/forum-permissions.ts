import type { ForumTopicStatus, Prisma } from "@prisma/client";
import type { AuthUser } from "@/lib/auth-helpers";

/** Filtre public : sujets non supprimés, non masqués. */
export function publicTopicWhere(
  extra: Prisma.ForumTopicWhereInput = {},
): Prisma.ForumTopicWhereInput {
  return {
    deletedAt: null,
    isHidden: false,
    ...extra,
  };
}

/** Sujets visibles dans les listes principales (hors archivés). */
export function publicTopicListWhere(
  extra: Prisma.ForumTopicWhereInput = {},
): Prisma.ForumTopicWhereInput {
  return publicTopicWhere({
    status: { not: "ARCHIVED" },
    ...extra,
  });
}

/** Filtre public : messages non supprimés, non masqués. */
export function publicPostWhere(
  extra: Prisma.ForumPostWhereInput = {},
): Prisma.ForumPostWhereInput {
  return {
    deletedAt: null,
    isHidden: false,
    ...extra,
  };
}

export function canModerateForum(user: AuthUser | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function canWriteForum(user: AuthUser | null | undefined): boolean {
  return Boolean(user);
}

export function canEditForumPost(
  user: AuthUser | null | undefined,
  authorId: string,
): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.id === authorId;
}

export function canEditForumTopic(
  user: AuthUser | null | undefined,
  authorId: string,
): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.id === authorId;
}

export function canReplyToTopicStatus(status: ForumTopicStatus): boolean {
  return status === "OPEN";
}

export function assertCanWriteForum(user: AuthUser): void {
  if (!canWriteForum(user)) {
    throw new Error("Non autorisé");
  }
}

export function assertCanModerateForum(user: AuthUser): void {
  if (!canModerateForum(user)) {
    throw new Error("Accès réservé aux administrateurs");
  }
}

export function assertCanEditForumPost(user: AuthUser, authorId: string): void {
  if (!canEditForumPost(user, authorId)) {
    throw new Error("Vous ne pouvez pas modifier ce message");
  }
}

export function assertCanEditForumTopic(user: AuthUser, authorId: string): void {
  if (!canEditForumTopic(user, authorId)) {
    throw new Error("Vous ne pouvez pas modifier ce sujet");
  }
}
