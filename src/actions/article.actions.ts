"use server";

import { revalidatePath } from "next/cache";
import { ArticleStatus } from "@prisma/client";
import { requireAuth } from "@/lib/auth-helpers";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  archiveArticle,
  createArticle,
  deleteArticle,
  getArticleById,
  isSlugTaken,
  republishArticle,
  updateArticle,
} from "@/lib/services/article.service";
import {
  articleFormSchema,
  getFirstZodErrorMessage,
  normalizeArticleFormInput,
  publishArticleSchema,
  type ArticleFormInput,
} from "@/lib/validations/article";
import { slugify } from "@/lib/utils";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

async function assertCanEdit(articleId: string) {
  const user = await requireAuth();
  const article = await getArticleById(articleId);

  if (!article) {
    throw new Error("Article introuvable");
  }

  if (user.role !== "ADMIN" && article.authorId !== user.id) {
    throw new Error("Vous ne pouvez modifier que vos propres articles");
  }

  return { user, article };
}

function buildArticlePayload(input: ArticleFormInput, status: ArticleStatus) {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: input.excerpt.trim(),
    content: sanitizeHtml(input.content),
    coverImageUrl: input.coverImageUrl ?? null,
    coverImagePublicId: input.coverImagePublicId ?? null,
    status,
    categoryIds: input.categoryIds,
    ...(status === ArticleStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
  };
}

export async function createArticleAction(
  input: ArticleFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const parsed = articleFormSchema.safeParse(normalizeArticleFormInput(input));

    if (!parsed.success) {
      return actionError(getFirstZodErrorMessage(parsed.error));
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);
    if (await isSlugTaken(slug)) {
      return actionError("Ce slug est déjà utilisé");
    }

    const article = await createArticle({
      ...buildArticlePayload({ ...parsed.data, slug }, ArticleStatus.DRAFT),
      authorId: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath("/");

    return actionSuccess({ id: article.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la création");
  }
}

export async function updateArticleAction(
  id: string,
  input: ArticleFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    await assertCanEdit(id);
    const parsed = articleFormSchema.safeParse(normalizeArticleFormInput(input));

    if (!parsed.success) {
      return actionError(getFirstZodErrorMessage(parsed.error));
    }

    if (await isSlugTaken(parsed.data.slug, id)) {
      return actionError("Ce slug est déjà utilisé");
    }

    const article = await updateArticle(
      id,
      buildArticlePayload(parsed.data, parsed.data.status),
    );

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    revalidatePath("/");

    return actionSuccess({ id: article.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
  }
}

export async function saveDraftAction(
  id: string | null,
  input: ArticleFormInput,
): Promise<ActionResult<{ id: string }>> {
  const draftInput = { ...input, status: "DRAFT" as const };
  if (id) {
    return updateArticleAction(id, draftInput);
  }
  return createArticleAction(draftInput);
}

export async function publishArticleAction(
  id: string | null,
  input: ArticleFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const publishInput = {
      ...normalizeArticleFormInput(input),
      status: "PUBLISHED" as const,
    };
    const parsed = publishArticleSchema.safeParse(publishInput);

    if (!parsed.success) {
      return actionError(getFirstZodErrorMessage(parsed.error));
    }

    if (id) {
      await assertCanEdit(id);
      if (await isSlugTaken(parsed.data.slug, id)) {
        return actionError("Ce slug est déjà utilisé");
      }

      const article = await updateArticle(
        id,
        buildArticlePayload(parsed.data, ArticleStatus.PUBLISHED),
      );

      revalidatePath("/");
      revalidatePath("/admin");
      revalidatePath("/admin/articles");
      return actionSuccess({ id: article.id });
    }

    const slug = parsed.data.slug || slugify(parsed.data.title);
    if (await isSlugTaken(slug)) {
      return actionError("Ce slug est déjà utilisé");
    }

    const article = await createArticle({
      ...buildArticlePayload({ ...parsed.data, slug }, ArticleStatus.PUBLISHED),
      authorId: user.id,
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    return actionSuccess({ id: article.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la publication");
  }
}

export async function archiveArticleAction(id: string): Promise<ActionResult<void>> {
  try {
    const { article } = await assertCanEdit(id);

    if (article.status === ArticleStatus.ARCHIVED) {
      return actionError("Cet article est déjà archivé");
    }

    await archiveArticle(id);

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    revalidatePath("/");
    revalidatePath(`/a/${article.slug}`);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de l'archivage");
  }
}

export async function republishArticleAction(id: string): Promise<ActionResult<void>> {
  try {
    const { article } = await assertCanEdit(id);

    if (article.status !== ArticleStatus.ARCHIVED) {
      return actionError("Seuls les articles archivés peuvent être republiés");
    }

    await republishArticle(id);

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    revalidatePath("/");
    revalidatePath(`/a/${article.slug}`);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la republication");
  }
}

export async function deleteArticleAction(id: string): Promise<ActionResult<void>> {
  try {
    const { article } = await assertCanEdit(id);

    if (article.status !== ArticleStatus.ARCHIVED) {
      return actionError(
        "Seuls les articles archivés peuvent être supprimés. Archivez d'abord l'article.",
      );
    }

    await deleteArticle(id);

    revalidatePath("/admin");
    revalidatePath("/admin/articles");
    revalidatePath("/");
    revalidatePath(`/a/${article.slug}`);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la suppression");
  }
}
