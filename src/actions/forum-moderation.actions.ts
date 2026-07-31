"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  createForumCategory,
  deleteForumCategory,
  getForumCategoryById,
  reorderForumCategories,
  updateForumCategory,
} from "@/lib/services/forum-category.service";
import {
  getForumPostById,
  restoreForumPost,
  setForumPostHidden,
  softDeleteForumPost,
} from "@/lib/services/forum-post.service";
import {
  getForumTopicById,
  hardDeleteForumTopic,
  moveForumTopic,
  restoreForumTopic,
  setForumTopicHidden,
  setForumTopicPinned,
  setForumTopicStatus,
  softDeleteForumTopic,
} from "@/lib/services/forum-topic.service";
import {
  createForumCategorySchema,
  forumIdSchema,
  forumTopicStatusSchema,
  getFirstForumZodError,
  reorderForumCategoriesSchema,
  updateForumCategorySchema,
} from "@/lib/validations/forum";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

function revalidateForumAdmin(topicSlug?: string, categorySlug?: string) {
  revalidatePath("/forum");
  revalidatePath("/admin/forum");
  revalidatePath("/admin/forum/rubriques");
  if (categorySlug) revalidatePath(`/forum/r/${categorySlug}`);
  if (topicSlug) revalidatePath(`/forum/s/${topicSlug}`);
}

export async function createForumCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const parsed = createForumCategorySchema.safeParse(input);

    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    const category = await createForumCategory(parsed.data);
    revalidateForumAdmin(undefined, category.slug);

    return actionSuccess({ id: category.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updateForumCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await getForumCategoryById(id);
    if (!existing) {
      return actionError("Rubrique introuvable");
    }

    const parsed = updateForumCategorySchema.safeParse(input);
    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    await updateForumCategory(id, parsed.data);
    revalidateForumAdmin(undefined, existing.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function reorderForumCategoriesAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = reorderForumCategoriesSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    await reorderForumCategories(parsed.data.orderedIds);
    revalidateForumAdmin();

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function deleteForumCategoryAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const existing = await getForumCategoryById(id);
    if (!existing) {
      return actionError("Rubrique introuvable");
    }

    await deleteForumCategory(id);
    revalidateForumAdmin(undefined, existing.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function hideForumTopicAction(
  id: string,
  isHidden: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumIdSchema.safeParse(id);
    if (!parsed.success) return actionError("Identifiant invalide");

    const topic = await getForumTopicById(parsed.data);
    if (!topic) return actionError("Sujet introuvable");

    await setForumTopicHidden(parsed.data, isHidden);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function softDeleteForumTopicAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const topic = await getForumTopicById(id);
    if (!topic) return actionError("Sujet introuvable");

    await softDeleteForumTopic(id);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function hardDeleteForumTopicAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumIdSchema.safeParse(id);
    if (!parsed.success) return actionError("Identifiant invalide");

    const topic = await getForumTopicById(parsed.data);
    if (!topic) return actionError("Sujet introuvable");

    await hardDeleteForumTopic(parsed.data);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function restoreForumTopicAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const topic = await getForumTopicById(id);
    if (!topic) return actionError("Sujet introuvable");

    await restoreForumTopic(id);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function setForumTopicPinnedAction(
  id: string,
  isPinned: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const topic = await getForumTopicById(id);
    if (!topic) return actionError("Sujet introuvable");

    await setForumTopicPinned(id, isPinned);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function setForumTopicStatusAction(
  id: string,
  status: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumTopicStatusSchema.safeParse(status);
    if (!parsed.success) return actionError("Statut invalide");

    const topic = await getForumTopicById(id);
    if (!topic) return actionError("Sujet introuvable");

    await setForumTopicStatus(id, parsed.data);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function moveForumTopicAction(
  id: string,
  categoryId: unknown,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumIdSchema.safeParse(categoryId);
    if (!parsed.success) return actionError("Rubrique invalide");

    const topic = await getForumTopicById(id);
    if (!topic) return actionError("Sujet introuvable");

    await moveForumTopic(id, parsed.data);
    revalidateForumAdmin(topic.slug, topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function hideForumPostAction(
  id: string,
  isHidden: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumIdSchema.safeParse(id);
    if (!parsed.success) return actionError("Identifiant invalide");

    const post = await getForumPostById(parsed.data);
    if (!post) return actionError("Message introuvable");

    await setForumPostHidden(parsed.data, isHidden);
    revalidateForumAdmin(post.topic.slug, post.topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function softDeleteForumPostAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumIdSchema.safeParse(id);
    if (!parsed.success) return actionError("Identifiant invalide");

    const post = await getForumPostById(parsed.data);
    if (!post) return actionError("Message introuvable");

    await softDeleteForumPost(parsed.data);
    revalidateForumAdmin(post.topic.slug, post.topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function restoreForumPostAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsed = forumIdSchema.safeParse(id);
    if (!parsed.success) return actionError("Identifiant invalide");

    const post = await getForumPostById(parsed.data);
    if (!post) return actionError("Message introuvable");

    await restoreForumPost(parsed.data);
    revalidateForumAdmin(post.topic.slug, post.topic.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}
