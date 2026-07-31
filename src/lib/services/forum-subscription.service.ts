import { prisma } from "@/lib/prisma";

export async function ensureForumTopicSubscription(userId: string, topicId: string) {
  return prisma.forumTopicSubscription.upsert({
    where: {
      topicId_userId: { topicId, userId },
    },
    update: {},
    create: {
      topicId,
      userId,
      isActive: true,
    },
  });
}

export async function setForumTopicSubscription(userId: string, topicId: string, isActive: boolean) {
  return prisma.forumTopicSubscription.upsert({
    where: {
      topicId_userId: { topicId, userId },
    },
    update: { isActive },
    create: {
      topicId,
      userId,
      isActive,
    },
  });
}

export async function getForumTopicSubscriptionState(userId: string, topicId: string) {
  const subscription = await prisma.forumTopicSubscription.findUnique({
    where: {
      topicId_userId: { topicId, userId },
    },
    select: { isActive: true },
  });

  return subscription?.isActive ?? false;
}

export async function getSubscribedForumTopicsForUser(userId: string) {
  return prisma.forumTopicSubscription.findMany({
    where: {
      userId,
      isActive: true,
      topic: {
        deletedAt: null,
        isHidden: false,
        category: { isActive: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      updatedAt: true,
      topic: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          lastPostAt: true,
          postsCount: true,
          category: { select: { name: true, slug: true } },
          articles: {
            select: {
              article: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
