import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  buildDocumentAccessWhere,
  publicDocumentInclude,
  type DocumentAccessUser,
} from "@/lib/services/document.service";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import type { CreateArticleInput, UpdateArticleInput } from "@/lib/validations/article";

const articleWithRelations = {
  author: { select: { id: true, name: true } },
  project: {
    select: {
      id: true,
      title: true,
      slug: true,
      color: true,
      isActive: true,
      category: {
        select: { id: true, name: true, slug: true, color: true },
      },
    },
  },
  categories: {
    include: {
      category: {
        include: {
          projects: {
            select: { id: true, title: true, slug: true, color: true, isActive: true },
            orderBy: { sortOrder: "asc" as const },
          },
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
  options: { projectId?: string | null; categoryIds?: string[] } = {},
  limit = 3,
) {
  const { projectId, categoryIds = [] } = options;
  const relatedFilter: Prisma.ArticleWhereInput[] = [];

  if (projectId) {
    relatedFilter.push({ projectId });
  }
  if (categoryIds.length > 0) {
    relatedFilter.push({ categories: { some: { categoryId: { in: categoryIds } } } });
  }

  if (relatedFilter.length === 0) {
    return getPublishedArticles(limit, 0).then((articles) =>
      articles.filter((article) => article.id !== articleId).slice(0, limit),
    );
  }

  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      id: { not: articleId },
      OR: relatedFilter,
    },
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getArticleBySlug(slug: string, user?: DocumentAccessUser | null) {
  return prisma.article.findFirst({
    where: {
      slug,
      ...publishedWhere(),
    },
    include: {
      ...articleWithRelations,
      documents: {
        where: buildDocumentAccessWhere(user),
        include: publicDocumentInclude,
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

function categorySlugWhere(slug: string): Prisma.ArticleWhereInput {
  return {
    OR: [
      { project: { category: { slug } } },
      { categories: { some: { category: { slug } } } },
    ],
  };
}

export async function getArticlesByCategorySlug(slug: string, limit = 12, offset = 0) {
  return prisma.article.findMany({
    where: {
      ...publishedWhere(),
      ...categorySlugWhere(slug),
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
      ...categorySlugWhere(slug),
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
  contentType?: "project" | "news" | "formation" | null;
  excludeArticleIds?: string[];
};

export function buildPublicArticleWhere(
  filters: PublicArticleFilters = {},
): Prisma.ArticleWhereInput {
  const conditions: Prisma.ArticleWhereInput[] = [publishedWhere()];

  if (filters.categorySlug) {
    conditions.push(categorySlugWhere(filters.categorySlug));
  }

  if (filters.projectSlug) {
    conditions.push({ project: { slug: filters.projectSlug } });
  }

  if (filters.authorId) {
    conditions.push({ authorId: filters.authorId });
  }

  if (filters.contentType === "project") {
    conditions.push({ projectId: { not: null } });
  } else if (filters.contentType === "news") {
    conditions.push({
      categories: { some: { category: { slug: "actualites" } } },
    });
  } else if (filters.contentType === "formation") {
    conditions.push({
      categories: { some: { category: { slug: "formation" } } },
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
  return !article.projectId;
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
  const { categoryIds, projectId, ...articleData } = data;

  return prisma.article.create({
    data: {
      ...articleData,
      projectId: projectId ?? null,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
    include: articleWithRelations,
  });
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const { categoryIds, projectId, ...articleData } = data;

  if (categoryIds) {
    await prisma.articleCategory.deleteMany({ where: { articleId: id } });
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...articleData,
      ...(projectId !== undefined ? { projectId } : {}),
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

  // Documents liés à l'article héritent du projet de l'article.
  if (projectId !== undefined) {
    await prisma.document.updateMany({
      where: { articleId: id },
      data: { projectId: projectId ?? null },
    });
  }

  return article;
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
  projectId?: string;
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
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
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
  const documentFilter = isAdmin ? {} : { uploadedById: userId };
  const listTake = 20;

  const articleList = (status?: ArticleStatus | ArticleStatus[]) =>
    prisma.article.findMany({
      where: {
        ...authorFilter,
        ...(status
          ? { status: Array.isArray(status) ? { in: status } : status }
          : {}),
      },
      include: articleWithRelations,
      orderBy: { updatedAt: "desc" },
      take: listTake,
    });

  const [
    published,
    drafts,
    archived,
    documents,
    recentArticles,
    publishedArticles,
    draftArticles,
    archivedArticles,
    recentDocuments,
  ] = await Promise.all([
    prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.PUBLISHED } }),
    prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.DRAFT } }),
    prisma.article.count({ where: { ...authorFilter, status: ArticleStatus.ARCHIVED } }),
    prisma.document.count({ where: documentFilter }),
    articleList(),
    articleList(ArticleStatus.PUBLISHED),
    articleList(ArticleStatus.DRAFT),
    articleList(ArticleStatus.ARCHIVED),
    prisma.document.findMany({
      where: documentFilter,
      orderBy: { createdAt: "desc" },
      take: listTake,
      include: {
        article: { select: { id: true, title: true } },
        project: { select: { id: true, title: true } },
        uploadedBy: { select: { id: true, name: true } },
      },
    }),
  ]);

  return {
    published,
    drafts,
    archived,
    documents,
    recentArticles,
    publishedArticles,
    draftArticles,
    archivedArticles,
    recentDocuments,
    /** @deprecated use draftArticles — kept for profil page compat */
    userDrafts: draftArticles,
  };
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
