import type { Prisma } from "@prisma/client";
import { canReplyToTopicStatus, publicPostWhere } from "@/lib/forum-permissions";
import { prisma } from "@/lib/prisma";

const postInclude = {
  author: { select: { id: true, name: true } },
} satisfies Prisma.ForumPostInclude;

export type ForumPostItem = Prisma.ForumPostGetPayload<{
  include: typeof postInclude;
}>;

export async function getForumPostsByTopicId(
  topicId: string,
  {
    limit = 20,
    offset = 0,
    asAdmin = false,
  }: { limit?: number; offset?: number; asAdmin?: boolean } = {},
) {
  return prisma.forumPost.findMany({
    where: asAdmin ? { topicId } : publicPostWhere({ topicId }),
    orderBy: { createdAt: "asc" },
    take: limit,
    skip: offset,
    include: postInclude,
  });
}

export async function countForumPostsByTopicId(
  topicId: string,
  { asAdmin = false }: { asAdmin?: boolean } = {},
) {
  return prisma.forumPost.count({
    where: asAdmin ? { topicId } : publicPostWhere({ topicId }),
  });
}

export async function getForumPostById(id: string) {
  return prisma.forumPost.findUnique({
    where: { id },
    include: {
      ...postInclude,
      topic: {
        select: {
          id: true,
          slug: true,
          status: true,
          authorId: true,
          deletedAt: true,
          isHidden: true,
          category: { select: { id: true, slug: true, name: true } },
        },
      },
    },
  });
}

export type AdminForumPostFilters = {
  search?: string;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
};

export async function getAdminForumPosts(filters: AdminForumPostFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const search = filters.search?.trim();

  const where: Prisma.ForumPostWhereInput = {
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
    ...(search
      ? {
          OR: [
            { body: { contains: search, mode: "insensitive" } },
            { topic: { title: { contains: search, mode: "insensitive" } } },
            { author: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.forumPost.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        ...postInclude,
        topic: {
          select: {
            id: true,
            title: true,
            slug: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    }),
    prisma.forumPost.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createForumPost(authorId: string, topicId: string, body: string) {
  const topic = await prisma.forumTopic.findUnique({
    where: { id: topicId },
    select: {
      id: true,
      status: true,
      deletedAt: true,
      isHidden: true,
    },
  });

  if (!topic || topic.deletedAt || topic.isHidden) {
    throw new Error("Sujet introuvable");
  }

  if (!canReplyToTopicStatus(topic.status)) {
    throw new Error("Ce sujet est verrouillé ou archivé — aucune réponse possible");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const createdPost = await tx.forumPost.create({
      data: {
        body,
        topicId,
        authorId,
      },
      include: postInclude,
    });

    await tx.forumTopic.update({
      where: { id: topicId },
      data: {
        postsCount: { increment: 1 },
        lastPostAt: now,
      },
    });

    await tx.forumTopicSubscription.upsert({
      where: {
        topicId_userId: { topicId, userId: authorId },
      },
      update: {},
      create: {
        topicId,
        userId: authorId,
        isActive: true,
      },
    });

    return createdPost;
  });
}

export async function updateForumPost(id: string, body: string) {
  const existing = await prisma.forumPost.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new Error("Message introuvable");
  }

  return prisma.forumPost.update({
    where: { id },
    data: { body },
    include: postInclude,
  });
}

export async function setForumPostHidden(id: string, isHidden: boolean) {
  return prisma.forumPost.update({
    where: { id },
    data: { isHidden },
  });
}

export async function softDeleteForumPost(id: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id },
    select: { id: true, topicId: true, deletedAt: true },
  });

  if (!post) {
    throw new Error("Message introuvable");
  }

  if (post.deletedAt) {
    return post;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.forumPost.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await tx.forumTopic.update({
      where: { id: post.topicId },
      data: {
        postsCount: { decrement: 1 },
      },
    });

    return updated;
  });
}

export async function restoreForumPost(id: string) {
  const post = await prisma.forumPost.findUnique({
    where: { id },
    select: { id: true, topicId: true, deletedAt: true },
  });

  if (!post) {
    throw new Error("Message introuvable");
  }

  if (!post.deletedAt) {
    return post;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.forumPost.update({
      where: { id },
      data: { deletedAt: null },
    });

    await tx.forumTopic.update({
      where: { id: post.topicId },
      data: {
        postsCount: { increment: 1 },
      },
    });

    return updated;
  });
}
