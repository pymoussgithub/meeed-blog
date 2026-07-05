"use server";

import { hash } from "bcryptjs";
import { signOut } from "@/lib/auth";
import { createUser, isEmailTaken } from "@/lib/services/user.service";
import { registerUserSchema } from "@/lib/validations/user";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
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

    return actionSuccess({ id: user.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}
