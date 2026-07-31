"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  reorderCategories,
  updateCategory,
} from "@/lib/services/category.service";
import {
  createCategorySchema,
  reorderCategoriesSchema,
  updateCategorySchema,
} from "@/lib/validations/category";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = createCategorySchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const category = await createCategory(parsed.data);

    revalidatePath("/admin/categories");
    revalidatePath("/");

    return actionSuccess({ id: category.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await getCategoryById(id);

    if (!existing) {
      return actionError("Catégorie introuvable");
    }

    const parsed = updateCategorySchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    await updateCategory(id, parsed.data);

    revalidatePath("/admin/categories");
    revalidatePath("/");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function reorderCategoriesAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderCategoriesSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    await reorderCategories(parsed.data.orderedIds);

    revalidatePath("/admin/categories");
    revalidatePath("/");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await getCategoryById(id);

    if (!existing) {
      return actionError("Catégorie introuvable");
    }

    await deleteCategory(id);

    revalidatePath("/admin/categories");
    revalidatePath("/");
    revalidatePath("/actualites");
    revalidatePath(`/c/${existing.slug}`);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la suppression");
  }
}
