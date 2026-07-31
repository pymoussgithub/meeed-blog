"use server";

import { revalidatePath } from "next/cache";
import { compare, hash } from "bcryptjs";
import { signOut } from "@/lib/auth";
import { requireAdmin, requireAuth } from "@/lib/auth-helpers";
import { sendAccountCreatedEmail } from "@/lib/mail";
import {
  createUser,
  deleteUser,
  getUserById,
  isEmailTaken,
  updateUser,
  updateUserPassword,
} from "@/lib/services/user.service";
import {
  changePasswordSchema,
  createUserSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateUserSchema,
} from "@/lib/validations/user";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

export async function createUserAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = createUserSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    if (await isEmailTaken(parsed.data.email)) {
      return actionError("Cet email est déjà utilisé");
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const user = await createUser({ ...parsed.data, passwordHash });

    await sendAccountCreatedEmail({
      email: user.email,
      name: user.name,
    });

    revalidatePath("/admin/utilisateurs");

    return actionSuccess({ id: user.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updateUserAction(id: string, input: unknown): Promise<ActionResult> {
  try {
    const currentUser = await requireAdmin();
    const parsed = updateUserSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const target = await getUserById(id);
    if (!target) {
      return actionError("Utilisateur introuvable");
    }

    if (currentUser.id === id && parsed.data.isActive === false) {
      return actionError("Vous ne pouvez pas désactiver votre propre compte");
    }

    await updateUser(id, parsed.data);

    revalidatePath("/admin/utilisateurs");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function resetUserPasswordAction(
  id: string,
  input: unknown,
): Promise<ActionResult<{ requiresReauth: boolean }>> {
  try {
    const currentUser = await requireAdmin();
    const parsed = resetPasswordSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const target = await getUserById(id);
    if (!target) {
      return actionError("Utilisateur introuvable");
    }

    const passwordHash = await hash(parsed.data.password, 12);
    await updateUserPassword(id, passwordHash);

    // Changer son propre MDP invalide credentialsVersion : un revalidatePath
    // ferait alors redirect() dans le layout admin → erreur RSC côté client.
    if (currentUser.id === id) {
      await signOut({ redirect: false });
      return actionSuccess({ requiresReauth: true });
    }

    return actionSuccess({ requiresReauth: false });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const currentUser = await requireAdmin();

    if (currentUser.id === id) {
      return actionError("Vous ne pouvez pas supprimer votre propre compte");
    }

    const target = await getUserById(id);
    if (!target) {
      return actionError("Utilisateur introuvable");
    }

    await deleteUser(id, currentUser.id);

    revalidatePath("/admin/utilisateurs");
    revalidatePath("/admin");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  try {
    const currentUser = await requireAuth();
    const parsed = updateProfileSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    await updateUser(currentUser.id, { name: parsed.data.name });

    revalidatePath("/admin/profil");
    revalidatePath("/admin");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  try {
    const currentUser = await requireAuth();
    const parsed = changePasswordSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const user = await getUserById(currentUser.id);
    if (!user) {
      return actionError("Utilisateur introuvable");
    }

    const isValid = await compare(parsed.data.currentPassword, user.passwordHash);
    if (!isValid) {
      return actionError("Mot de passe actuel incorrect");
    }

    const passwordHash = await hash(parsed.data.newPassword, 12);
    await updateUserPassword(currentUser.id, passwordHash);
    // Invalide le JWT courant ; les autres sessions échouent via credentialsVersion
    await signOut({ redirect: false });

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}
