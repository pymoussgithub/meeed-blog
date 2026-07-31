"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-helpers";
import {
  assertCanEditForumPost,
  assertCanEditForumTopic,
} from "@/lib/forum-permissions";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  createForumPost,
  getForumPostById,
  updateForumPost,
} from "@/lib/services/forum-post.service";
import { getForumReplyNotificationRecipients } from "@/lib/services/forum-notify.service";
import {
  createForumTopic,
  getForumTopicById,
  updateForumTopic,
} from "@/lib/services/forum-topic.service";
import { notifyForumParticipantsOfReply } from "@/lib/mail";
import {
  createForumPostSchema,
  createForumTopicSchema,
  forumIdSchema,
  getFirstForumZodError,
  updateForumPostSchema,
  updateForumTopicSchema,
} from "@/lib/validations/forum";
import { setForumTopicSubscription } from "@/lib/services/forum-subscription.service";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

function revalidateForumPaths(topicSlug?: string, categorySlug?: string) {
  revalidatePath("/forum");
  if (categorySlug) {
    revalidatePath(`/forum/r/${categorySlug}`);
  }
  if (topicSlug) {
    revalidatePath(`/forum/s/${topicSlug}`);
  }
}

export async function createTopicAction(
  input: unknown,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const user = await requireAuth();
    const parsed = createForumTopicSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    const topic = await createForumTopic(user.id, {
      ...parsed.data,
      body: sanitizeHtml(parsed.data.body),
    });

    revalidateForumPaths(topic.slug, topic.category.slug);

    for (const link of topic.articles) {
      const linkedArticle = link.article;
      if (!linkedArticle) continue;
      revalidatePath(`/a/${linkedArticle.slug}`);
      revalidatePath(`/forum/article/${linkedArticle.slug}`);
    }

    return actionSuccess({ id: topic.id, slug: topic.slug });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function createReplyAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const parsed = createForumPostSchema.safeParse(input);

    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    const topic = await getForumTopicById(parsed.data.topicId);
    if (!topic || topic.deletedAt || topic.isHidden) {
      return actionError("Sujet introuvable");
    }

    const body = sanitizeHtml(parsed.data.body);
    const post = await createForumPost(user.id, parsed.data.topicId, body);

    revalidateForumPaths(topic.slug, topic.category.slug);

    // Notifications : ne jamais faire échouer la publication
    try {
      const recipients = await getForumReplyNotificationRecipients(
        topic.id,
        user.id,
      );
      await notifyForumParticipantsOfReply({
        topicTitle: topic.title,
        topicSlug: topic.slug,
        replyBody: body,
        recipientEmails: recipients,
      });
    } catch (notifyError) {
      console.error("[forum] Notification e-mail échouée:", notifyError);
    }

    return actionSuccess({ id: post.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function setForumTopicSubscriptionAction(
  topicId: string,
  subscribed: boolean,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const parsedTopicId = forumIdSchema.safeParse(topicId);

    if (!parsedTopicId.success) {
      return actionError("Sujet invalide");
    }

    const topic = await getForumTopicById(parsedTopicId.data);
    if (!topic || topic.deletedAt || topic.isHidden) {
      return actionError("Sujet introuvable");
    }

    await setForumTopicSubscription(user.id, topic.id, subscribed);

    revalidateForumPaths(topic.slug, topic.category.slug);
    revalidatePath("/admin/profil");
    revalidatePath("/admin/forum/abonnements");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updateTopicAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const existing = await getForumTopicById(id);

    if (!existing || existing.deletedAt) {
      return actionError("Sujet introuvable");
    }

    assertCanEditForumTopic(user, existing.authorId);

    const parsed = updateForumTopicSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    // Les contributeurs ne peuvent pas changer statut / pin (réservé admin)
    const data =
      user.role === "ADMIN"
        ? parsed.data
        : {
            title: parsed.data.title,
            categoryId: parsed.data.categoryId,
          };

    await updateForumTopic(id, data);
    revalidateForumPaths(existing.slug, existing.category.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function updatePostAction(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const existing = await getForumPostById(id);

    if (!existing || existing.deletedAt) {
      return actionError("Message introuvable");
    }

    assertCanEditForumPost(user, existing.authorId);

    const parsed = updateForumPostSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(getFirstForumZodError(parsed.error));
    }

    await updateForumPost(id, sanitizeHtml(parsed.data.body));
    revalidateForumPaths(existing.topic.slug);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}
