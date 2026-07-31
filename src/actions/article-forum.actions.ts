"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, type AuthUser } from "@/lib/auth-helpers";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  createForumTopicLinkedToArticle,
  linkArticleToForumTopic,
  unlinkArticleFromForumTopic,
} from "@/lib/services/article-forum.service";
import { getArticleById } from "@/lib/services/article.service";
import {
  createForumTopicSchema,
  forumIdSchema,
  getFirstForumZodError,
} from "@/lib/validations/forum";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";
import { z } from "zod";

const linkSchema = z.object({
  articleId: forumIdSchema,
  topicId: forumIdSchema,
});

async function assertCanManageArticleForumLinks(articleId: string): Promise<{
  user: AuthUser;
}> {
  const user = await requireAuth();
  const article = await getArticleById(articleId);

  if (!article) {
    throw new Error("Article introuvable");
  }

  if (user.role !== "ADMIN" && article.authorId !== user.id) {
    throw new Error("Vous ne pouvez lier le forum que sur vos propres articles");
  }

  return { user };
}

async function revalidateArticleForum(articleId: string, topicSlug?: string) {
  const article = await getArticleById(articleId);
  revalidatePath("/forum");
  revalidatePath("/admin/forum");
  if (article) {
    revalidatePath(`/a/${article.slug}`);
    revalidatePath(`/forum/article/${article.slug}`);
    revalidatePath(`/admin/articles/${article.id}`);
  }
  if (topicSlug) {
    revalidatePath(`/forum/s/${topicSlug}`);
  }
}

export async function linkArticleForumTopicAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = linkSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    await assertCanManageArticleForumLinks(parsed.data.articleId);
    await linkArticleToForumTopic(parsed.data.articleId, parsed.data.topicId);
    await revalidateArticleForum(parsed.data.articleId);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function unlinkArticleForumTopicAction(
  input: unknown,
): Promise<ActionResult> {
  try {
    const parsed = linkSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    await assertCanManageArticleForumLinks(parsed.data.articleId);
    await unlinkArticleFromForumTopic(parsed.data.articleId, parsed.data.topicId);
    await revalidateArticleForum(parsed.data.articleId);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function createLinkedForumTopicAction(
  articleId: string,
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const idParsed = forumIdSchema.safeParse(articleId);
    if (!idParsed.success) return actionError("Article invalide");

    const { user } = await assertCanManageArticleForumLinks(idParsed.data);

    const parsed = createForumTopicSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    const topic = await createForumTopicLinkedToArticle(user.id, idParsed.data, {
      title: parsed.data.title,
      categoryId: parsed.data.categoryId,
      body: sanitizeHtml(parsed.data.body),
    });

    await revalidateArticleForum(idParsed.data, topic.slug);

    return actionSuccess({ id: topic.id, slug: topic.slug });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}
