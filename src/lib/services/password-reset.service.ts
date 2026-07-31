import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const PASSWORD_RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function buildPasswordResetExpiry() {
  return new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const record = await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: buildPasswordResetExpiry(),
    },
  });

  return { rawToken, record };
}

/** Après envoi réussi : un seul token actif par utilisateur. */
export async function revokeOtherPasswordResetTokens(userId: string, keepId: string) {
  return prisma.passwordResetToken.deleteMany({
    where: {
      userId,
      id: { not: keepId },
    },
  });
}

export async function deletePasswordResetToken(id: string) {
  return prisma.passwordResetToken.delete({ where: { id } }).catch(() => undefined);
}

export async function getValidPasswordResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  return prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });
}

export async function consumePasswordResetToken(id: string) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { consumedAt: new Date() },
  });
}

export async function deleteExpiredPasswordResetTokens() {
  return prisma.passwordResetToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lte: new Date() } }, { consumedAt: { not: null } }],
    },
  });
}
