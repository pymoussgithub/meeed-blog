"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createProject,
  deleteProject,
  getProjectById,
  isProjectSlugTaken,
  reorderProjects,
  updateProject,
} from "@/lib/services/project.service";
import {
  createProjectSchema,
  reorderProjectsSchema,
  updateProjectSchema,
} from "@/lib/validations/project";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

function revalidateProjectPaths(categorySlug: string) {
  revalidatePath("/admin/projets");
  revalidatePath("/projets");
  revalidatePath("/");
  revalidatePath(`/c/${categorySlug}`);
}

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

    revalidateProjectPaths(project.category.slug);

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

    const project = await updateProject(id, parsed.data);

    revalidateProjectPaths(existing.category.slug);
    if (project.category.slug !== existing.category.slug) {
      revalidatePath(`/c/${project.category.slug}`);
    }

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function reorderProjectsAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderProjectsSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    await reorderProjects(parsed.data.orderedIds);

    revalidatePath("/admin/projets");
    revalidatePath("/projets");
    revalidatePath("/");

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

    revalidateProjectPaths(existing.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la suppression");
  }
}
