"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createProject,
  deleteProject,
  getProjectById,
  isProjectSlugTaken,
  updateProject,
} from "@/lib/services/project.service";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

export async function createProjectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = createProjectSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    if (await isProjectSlugTaken(parsed.data.slug)) {
      return actionError("Ce slug est déjà utilisé");
    }

    const project = await createProject(parsed.data);

    revalidatePath("/admin/projets");
    revalidatePath("/projets");
    revalidatePath("/");
    revalidatePath(`/c/${project.slug}`);

    return actionSuccess({ id: project.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updateProjectAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await getProjectById(id);

    if (!existing) {
      return actionError("Projet introuvable");
    }

    const parsed = updateProjectSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    if (parsed.data.slug && (await isProjectSlugTaken(parsed.data.slug, id))) {
      return actionError("Ce slug est déjà utilisé");
    }

    await updateProject(id, parsed.data);

    revalidatePath("/admin/projets");
    revalidatePath("/projets");
    revalidatePath("/");
    revalidatePath(`/c/${existing.slug}`);
    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      revalidatePath(`/c/${parsed.data.slug}`);
    }

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult<void>> {
  try {
    await requireAdmin();
    const existing = await getProjectById(id);

    if (!existing) {
      return actionError("Projet introuvable");
    }

    await deleteProject(id);

    revalidatePath("/admin/projets");
    revalidatePath("/projets");
    revalidatePath("/");
    revalidatePath(`/c/${existing.slug}`);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la suppression");
  }
}
