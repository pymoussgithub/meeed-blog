"use server";

import { absoluteUrl } from "@/lib/seo";
import { hash } from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { isDevAccountSwitcherEnabled } from "@/lib/dev-mode";
import { sendAccountCreatedEmail, sendPasswordResetEmail } from "@/lib/mail";
import { sanitizeInternalPath } from "@/lib/safe-redirect";
import {
  createPasswordResetToken,
  deleteExpiredPasswordResetTokens,
  deletePasswordResetToken,
  getValidPasswordResetToken,
  revokeOtherPasswordResetTokens,
} from "@/lib/services/password-reset.service";
import { createUser, getUserByEmail, isEmailTaken, updateUserPassword } from "@/lib/services/user.service";
import {
  completePasswordResetSchema,
  registerUserSchema,
  requestPasswordResetSchema,
} from "@/lib/validations/user";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

export async function signOutAction(formData?: FormData) {
  const redirectTo = formData?.get("redirectTo");
  const safeRedirectTo = sanitizeInternalPath(
    typeof redirectTo === "string" ? redirectTo : null,
    "/admin/login",
  );

  await signOut({ redirectTo: safeRedirectTo });
}

export async function switchDevAccountAction(formData: FormData) {
  if (!isDevAccountSwitcherEnabled()) {
    throw new Error("Mode développeur désactivé");
  }

  const userId = formData.get("userId");
  const redirectTo = formData.get("redirectTo");

  if (typeof userId !== "string" || userId.length === 0) {
    throw new Error("Utilisateur invalide");
  }

  const safeRedirectTo = sanitizeInternalPath(
    typeof redirectTo === "string" ? redirectTo : null,
    "/admin",
  );

  await signIn("credentials", {
    devSwitchUserId: userId,
    redirectTo: safeRedirectTo,
  });
}

export async function registerAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = registerUserSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    if (await isEmailTaken(parsed.data.email)) {
      return actionError("Cet email est déjà utilisé");
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const user = await createUser({
      ...parsed.data,
      role: "CONTRIBUTEUR",
      passwordHash,
    });

    await sendAccountCreatedEmail({
      email: user.email,
      name: user.name,
    });

    return actionSuccess({ id: user.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

const PASSWORD_RESET_REQUEST_SUCCESS =
  "Si un compte existe pour cet e-mail, un lien de réinitialisation a été envoyé.";

export async function requestPasswordResetAction(
  input: unknown,
): Promise<ActionResult<{ message: string }>> {
  try {
    const parsed = requestPasswordResetSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    await deleteExpiredPasswordResetTokens();

    const user = await getUserByEmail(parsed.data.email);
    if (!user || !user.isActive) {
      return actionSuccess({ message: PASSWORD_RESET_REQUEST_SUCCESS });
    }

    const { rawToken, record } = await createPasswordResetToken(user.id);
    const resetUrl = absoluteUrl(`/reinitialiser-mot-de-passe?token=${rawToken}`);

    const sent = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    if (!sent) {
      await deletePasswordResetToken(record.id);
      return actionError(
        "Impossible d'envoyer l'e-mail de réinitialisation. Réessayez plus tard ou contactez un administrateur.",
      );
    }

    await revokeOtherPasswordResetTokens(user.id, record.id);

    return actionSuccess({ message: PASSWORD_RESET_REQUEST_SUCCESS });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function resetPasswordWithTokenAction(
  input: unknown,
): Promise<ActionResult<{ redirectTo: string }>> {
  try {
    const parsed = completePasswordResetSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const tokenRecord = await getValidPasswordResetToken(parsed.data.token);
    if (!tokenRecord || !tokenRecord.user.isActive) {
      return actionError("Ce lien est invalide ou expiré.");
    }

    const passwordHash = await hash(parsed.data.password, 12);

    // updateUserPassword invalide aussi les tokens de reset restants
    await updateUserPassword(tokenRecord.userId, passwordHash);
    // Coupe toute session JWT encore active pour ce compte
    await signOut({ redirect: false }).catch(() => undefined);

    return actionSuccess({ redirectTo: "/admin/login?reset=success" });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}
