import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { articles: true } },
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function createUser(data: CreateUserInput & { passwordHash: string }) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role as UserRole,
    },
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  return prisma.user.update({ where: { id }, data });
}

export async function updateUserPassword(id: string, passwordHash: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id },
      data: { passwordHash },
    });
    // Invalide les liens de reset encore valides après un changement de MDP
    await tx.passwordResetToken.deleteMany({ where: { userId: id } });
    return user;
  });
}

/** Supprime le compte et réattribue le contenu lié à un autre utilisateur (FK non nullables). */
export async function deleteUser(id: string, reassignToId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.article.updateMany({
      where: { authorId: id },
      data: { authorId: reassignToId },
    });
    await tx.document.updateMany({
      where: { uploadedById: id },
      data: { uploadedById: reassignToId },
    });
    await tx.forumTopic.updateMany({
      where: { authorId: id },
      data: { authorId: reassignToId },
    });
    await tx.forumPost.updateMany({
      where: { authorId: id },
      data: { authorId: reassignToId },
    });

    return tx.user.delete({ where: { id } });
  });
}

export async function getUserStats() {
  const [total, active, admins, contributors, totalArticles] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: UserRole.ADMIN } }),
    prisma.user.count({ where: { role: UserRole.CONTRIBUTEUR } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
  ]);

  return { total, active, admins, contributors, totalArticles };
}

export async function isEmailTaken(email: string, excludeId?: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(user);
}
