import type { ForumTopicStatus, Prisma } from "@prisma/client";
import {
  publicPostWhere,
  publicTopicListWhere,
  publicTopicWhere,
} from "@/lib/forum-permissions";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type {
  CreateForumTopicInput,
  ForumTopicSort,
  UpdateForumTopicInput,
} from "@/lib/validations/forum";

const topicListInclude = {
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true } },
  posts: {
    where: publicPostWhere(),
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.ForumTopicInclude;

const topicDetailInclude = {
  category: { select: { id: true, name: true, slug: true, isActive: true } },
  author: { select: { id: true, name: true } },
  articles: {
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          excerpt: true,
          coverImageUrl: true,
        },
      },
    },
  },
} satisfies Prisma.ForumTopicInclude;

export type ForumTopicListItem = Prisma.ForumTopicGetPayload<{
  include: typeof topicListInclude;
}>;

export type ForumTopicDetail = Prisma.ForumTopicGetPayload<{
  include: typeof topicDetailInclude;
}>;

async function ensureUniqueTopicSlug(base: string, excludeId?: string) {
  const candidate = slugify(base) || "sujet";
  let suffix = 0;

  while (true) {
    const slug = suffix === 0 ? candidate : `${candidate}-${suffix}`.slice(0, 80);
    const existing = await prisma.forumTopic.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return slug;
    suffix += 1;
  }
}

function sortOrderFor(sort: ForumTopicSort): Prisma.ForumTopicOrderByWithRelationInput[] {
  const secondary: Prisma.ForumTopicOrderByWithRelationInput =
    sort === "created"
      ? { createdAt: "desc" }
      : sort === "replies"
        ? { postsCount: "desc" }
        : { lastPostAt: "desc" };

  return [{ isPinned: "desc" }, secondary, { createdAt: "desc" }];
}

export async function getPinnedForumTopics(limit = 20, offset = 0) {
  return prisma.forumTopic.findMany({
    where: publicTopicListWhere({ isPinned: true }),
    orderBy: [{ lastPostAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    skip: offset,
    include: topicListInclude,
  });
}

export async function countPinnedForumTopics() {
  return prisma.forumTopic.count({
    where: publicTopicListWhere({ isPinned: true }),
  });
}

export async function getForumTopicsForArticleSlug(
  articleSlug: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
) {
  return prisma.forumTopic.findMany({
    where: publicTopicListWhere({
      articles: {
        some: {
          article: {
            slug: articleSlug,
            status: "PUBLISHED",
            publishedAt: { lte: new Date() },
          },
        },
      },
    }),
    orderBy: [{ isPinned: "desc" }, { lastPostAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    skip: offset,
    include: topicListInclude,
  });
}

export async function countForumTopicsForArticleSlug(articleSlug: string) {
  return prisma.forumTopic.count({
    where: publicTopicListWhere({
      articles: {
        some: {
          article: {
            slug: articleSlug,
            status: "PUBLISHED",
            publishedAt: { lte: new Date() },
          },
        },
      },
    }),
  });
}

export type AdminForumTopicFilters = {
  status?: ForumTopicStatus;
  categoryId?: string;
  search?: string;
  includeHidden?: boolean;
  includeDeleted?: boolean;
  page?: number;
  pageSize?: number;
};

export async function getAdminForumTopicStats() {
  const [open, locked, archived, total] = await Promise.all([
    prisma.forumTopic.count({ where: { status: "OPEN", deletedAt: null } }),
    prisma.forumTopic.count({ where: { status: "LOCKED", deletedAt: null } }),
    prisma.forumTopic.count({ where: { status: "ARCHIVED", deletedAt: null } }),
    prisma.forumTopic.count({ where: { deletedAt: null } }),
  ]);

  return { open, locked, archived, total };
}

export async function getAdminForumTopics(filters: AdminForumTopicFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const where: Prisma.ForumTopicWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.includeDeleted ? {} : { deletedAt: null }),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { slug: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [topics, total] = await Promise.all([
    prisma.forumTopic.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        ...topicListInclude,
        _count: { select: { posts: true } },
      },
    }),
    prisma.forumTopic.count({ where }),
  ]);

  return {
    topics,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getForumTopicsByCategorySlug(
  categorySlug: string,
  {
    limit = 20,
    offset = 0,
    sort = "recent" as ForumTopicSort,
  }: { limit?: number; offset?: number; sort?: ForumTopicSort } = {},
) {
  return prisma.forumTopic.findMany({
    where: publicTopicListWhere({
      category: { slug: categorySlug, isActive: true },
    }),
    orderBy: sortOrderFor(sort),
    take: limit,
    skip: offset,
    include: topicListInclude,
  });
}

export async function countForumTopicsByCategorySlug(categorySlug: string) {
  return prisma.forumTopic.count({
    where: publicTopicListWhere({
      category: { slug: categorySlug, isActive: true },
    }),
  });
}

export async function getForumTopicBySlug(
  slug: string,
  { asAdmin = false }: { asAdmin?: boolean } = {},
) {
  return prisma.forumTopic.findFirst({
    where: asAdmin ? { slug } : publicTopicWhere({ slug }),
    include: topicDetailInclude,
  });
}

export async function getForumTopicById(id: string) {
  return prisma.forumTopic.findUnique({
    where: { id },
    include: topicDetailInclude,
  });
}

export async function createForumTopic(
  authorId: string,
  data: CreateForumTopicInput & { body: string },
) {
  const category = await prisma.forumCategory.findFirst({
    where: { id: data.categoryId, isActive: true },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Rubrique introuvable ou inactive");
  }

  const articleIds = Array.from(new Set(data.articleIds ?? []));
  if (articleIds.length > 0) {
    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      select: { id: true },
    });
    if (articles.length !== articleIds.length) {
      throw new Error("Un ou plusieurs articles sont introuvables ou non publiés");
    }
  }

  const slug = await ensureUniqueTopicSlug(data.slug?.trim() || data.title);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const topic = await tx.forumTopic.create({
      data: {
        title: data.title.trim(),
        slug,
        categoryId: data.categoryId,
        authorId,
        postsCount: 1,
        lastPostAt: now,
        posts: {
          create: {
            body: data.body,
            authorId,
          },
        },
        ...(articleIds.length > 0
          ? {
              articles: {
                create: articleIds.map((articleId) => ({ articleId })),
              },
            }
          : {}),
      },
      include: topicDetailInclude,
    });

    await tx.forumTopicSubscription.upsert({
      where: {
        topicId_userId: { topicId: topic.id, userId: authorId },
      },
      update: { isActive: true },
      create: {
        topicId: topic.id,
        userId: authorId,
        isActive: true,
      },
    });

    return topic;
  });
}

export async function updateForumTopic(
  id: string,
  data: UpdateForumTopicInput & { title?: string },
) {
  const existing = await prisma.forumTopic.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Sujet introuvable");
  }

  if (data.categoryId) {
    const category = await prisma.forumCategory.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new Error("Rubrique introuvable");
    }
  }

  return prisma.forumTopic.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
    },
    include: topicDetailInclude,
  });
}

export async function setForumTopicStatus(id: string, status: ForumTopicStatus) {
  return prisma.forumTopic.update({
    where: { id },
    data: { status },
  });
}

export async function setForumTopicPinned(id: string, isPinned: boolean) {
  return prisma.forumTopic.update({
    where: { id },
    data: { isPinned },
  });
}

export async function setForumTopicHidden(id: string, isHidden: boolean) {
  return prisma.forumTopic.update({
    where: { id },
    data: { isHidden },
  });
}

export async function softDeleteForumTopic(id: string) {
  return prisma.forumTopic.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restoreForumTopic(id: string) {
  return prisma.forumTopic.update({
    where: { id },
    data: { deletedAt: null },
  });
}

/** Suppression définitive : sujet, messages, abonnements et liaisons articles. */
export async function hardDeleteForumTopic(id: string) {
  await prisma.$transaction([
    prisma.forumTopicSubscription.deleteMany({ where: { topicId: id } }),
    prisma.forumPost.deleteMany({ where: { topicId: id } }),
    prisma.articleForumTopic.deleteMany({ where: { topicId: id } }),
    prisma.forumTopic.delete({ where: { id } }),
  ]);
}

export async function moveForumTopic(id: string, categoryId: string) {
  const category = await prisma.forumCategory.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Rubrique introuvable");
  }

  return prisma.forumTopic.update({
    where: { id },
    data: { categoryId },
  });
}
