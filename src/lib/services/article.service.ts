import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import type { CreateArticleInput, UpdateArticleInput } from "@/lib/validations/article";

const articleWithRelations = {
  author: { select: { id: true, name: true } },
  categories: {
    include: {
      category: {
        include: {
          project: { select: { id: true, title: true, slug: true, color: true } },
        },
      },
    },
  },
} satisfies Prisma.ArticleInclude;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof articleWithRelations;
}>;

export async function getPublishedArticles(limit = 12, offset = 0) {
  return prisma.article.findMany({
    where: publishedWhere(),
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
}

function publishedWhere(): Prisma.ArticleWhereInput {
  return {
    status: ArticleStatus.PUBLISHED,
    publishedAt: { lte: new Date() },
  };
}

export async function countPublishedArticles() {
  return prisma.article.count({ where: publishedWhere() });
}

export async function getSimilarArticles(
  articleId: string,
  categoryIds: string[],
  limit = 3,
) {
  if (categoryIds.length === 0) {
    return getPublishedArticles(limit, 0).then((articles) =>
      articles.filter((article) => article.id !== articleId).slice(0, limit),
    );
  }

  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      id: { not: articleId },
      categories: { some: { categoryId: { in: categoryIds } } },
    },
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: {
      slug,
      ...publishedWhere(),
    },
    include: {
      ...articleWithRelations,
      documents: {
        where: { isPublic: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: articleWithRelations,
  });
}

export async function getArticlesByCategorySlug(slug: string, limit = 12, offset = 0) {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      categories: { some: { category: { slug } } },
    },
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function countArticlesByCategorySlug(slug: string) {
  return prisma.article.count({
    where: {
      ...publishedWhere(),
      categories: { some: { category: { slug } } },
    },
  });
}

export type PublicArticleFilters = {
  search?: string | null;
  categorySlug?: string | null;
  projectSlug?: string | null;
  authorId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  contentType?: "project" | "news" | null;
  excludeArticleIds?: string[];
};

export function buildPublicArticleWhere(
  filters: PublicArticleFilters = {},
): Prisma.ArticleWhereInput {
  const conditions: Prisma.ArticleWhereInput[] = [publishedWhere()];

  if (filters.categorySlug) {
    conditions.push({
      categories: { some: { category: { slug: filters.categorySlug } } },
    });
  }

  if (filters.projectSlug) {
    conditions.push({
      categories: { some: { category: { project: { slug: filters.projectSlug } } } },
    });
  }

  if (filters.authorId) {
    conditions.push({ authorId: filters.authorId });
  }

  if (filters.contentType === "project") {
    conditions.push({
      categories: { some: { category: { project: { isNot: null } } } },
    });
  } else if (filters.contentType === "news") {
    conditions.push({
      categories: { some: { category: { project: null } } },
    });
  }

  if (filters.dateFrom || filters.dateTo) {
    const publishedAt: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) {
      publishedAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      publishedAt.lte = end;
    }
    conditions.push({ publishedAt });
  }

  const search = filters.search?.trim();
  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.excludeArticleIds?.length) {
    conditions.push({ id: { notIn: filters.excludeArticleIds } });
  }

  return conditions.length === 1 ? conditions[0] : { AND: conditions };
}

function isNewsArticle(article: ArticleWithRelations) {
  return article.categories.some(({ category }) => !category.project);
}

function sortArticlesNewsFirst(articles: ArticleWithRelations[]) {
  return [...articles].sort((a, b) => {
    const aNews = isNewsArticle(a) ? 0 : 1;
    const bNews = isNewsArticle(b) ? 0 : 1;
    if (aNews !== bNews) return aNews - bNews;
    return (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0);
  });
}

export async function getFilteredPublishedArticles(
  filters: PublicArticleFilters,
  limit = 12,
  offset = 0,
  options?: { newsFirst?: boolean },
) {
  if (!options?.newsFirst) {
    return prisma.article.findMany({
      where: buildPublicArticleWhere(filters),
      include: articleWithRelations,
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  const all = await prisma.article.findMany({
    where: buildPublicArticleWhere(filters),
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
  });

  return sortArticlesNewsFirst(all).slice(offset, offset + limit);
}

export async function countFilteredPublishedArticles(filters: PublicArticleFilters) {
  return prisma.article.count({ where: buildPublicArticleWhere(filters) });
}

export async function getPublishedArticleAuthors() {
  return prisma.user.findMany({
    where: { articles: { some: publishedWhere() } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function searchArticles(query: string, limit = 20, offset = 0) {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function countSearchResults(query: string) {
  return prisma.article.count({
    where: {
      ...publishedWhere(),
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { excerpt: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
  });
}

export async function createArticle(data: CreateArticleInput) {
  const { categoryIds, ...articleData } = data;

  return prisma.article.create({
    data: {
      ...articleData,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
    include: articleWithRelations,
  });
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const { categoryIds, ...articleData } = data;

  if (categoryIds) {
    await prisma.articleCategory.deleteMany({ where: { articleId: id } });
  }

  return prisma.article.update({
    where: { id },
    data: {
      ...articleData,
      ...(categoryIds
        ? {
            categories: {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            },
          }
        : {}),
    },
    include: articleWithRelations,
  });
}

export async function archiveArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: { status: ArticleStatus.ARCHIVED },
  });
}

export async function republishArticle(id: string) {
  return prisma.article.update({
    where: { id },
    data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
  });
}

export async function deleteArticle(id: string) {
  const article = await prisma.article.findUnique({
    where: { id },
    select: { coverImagePublicId: true },
  });

  if (!article) {
    throw new Error("Article introuvable");
  }

  if (article.coverImagePublicId) {
    await removeCloudinaryAsset(article.coverImagePublicId, "image");
  }

  return prisma.article.delete({ where: { id } });
}

export type AdminArticleFilters = {
  status?: ArticleStatus;
  categoryId?: string;
  search?: string;
  authorId?: string;
  page?: number;
  pageSize?: number;
};

export async function getAdminArticles(filters: AdminArticleFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.ArticleWhereInput = {
    status: filters.status,
    ...(filters.authorId ? { authorId: filters.authorId } : {}),
    ...(filters.categoryId
      ? { categories: { some: { categoryId: filters.categoryId } } }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" } },
            { excerpt: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: articleWithRelations,
      orderBy: { updatedAt: "desc" },
      take: pageSize,
      skip,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminArticleStats(authorId?: string) {
  const authorFilter = authorId ? { authorId } : {};

  const [published, drafts, archived, total] = await Promise.all([
    prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.PUBLISHED } }),
    prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.DRAFT } }),
    prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.ARCHIVED } }),
    prisma.article.count({ where: authorFilter }),
  ]);

  return { published, drafts, archived, total };
}

export async function getDashboardStats(userId: string, isAdmin: boolean) {
  const authorFilter = isAdmin ? {} : { authorId: userId };

  const [published, drafts, archived, documents, recentArticles, userDrafts] =
    await Promise.all([
      prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.ARCHIVED } }),
      prisma.document.count({
        where: isAdmin ? {} : { uploadedById: userId },
      }),
      prisma.article.findMany({
        where: authorFilter,
        include: articleWithRelations,
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.article.findMany({
        where: { authorId: userId, status: ArticleStatus.DRAFT },
        include: articleWithRelations,
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

  return { published, drafts, archived, documents, recentArticles, userDrafts };
}

export async function isSlugTaken(slug: string, excludeId?: string) {
  const existing = await prisma.article.findFirst({
    where: {
      slug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
  return Boolean(existing);
}

export async function getPublishedArticleSlugs() {
  return prisma.article.findMany({
    where: publishedWhere(),
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}
