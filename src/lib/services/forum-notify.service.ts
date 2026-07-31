import { prisma } from "@/lib/prisma";

/** Destinataires d'une notification de réponse (hors auteur de la nouvelle réponse). */
export async function getForumReplyNotificationRecipients(
  topicId: string,
  excludeAuthorId: string,
) {
  const subscriptions = await prisma.forumTopicSubscription.findMany({
    where: {
      topicId,
      isActive: true,
      userId: { not: excludeAuthorId },
      user: { isActive: true },
    },
    select: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const byEmail = new Map<string, string>();

  for (const subscription of subscriptions) {
    const email = subscription.user.email?.trim();
    if (!email) continue;
    byEmail.set(email.toLowerCase(), email);
  }

  return [...byEmail.values()];
}
