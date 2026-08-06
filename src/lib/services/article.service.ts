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
  categories: {
    include: { category: true },
  },
} satisfies Prisma.ArticleInclude;

/** Champs carte/liste uniquement — pas de `content` imbriqué. */
const articleListingSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  coverImagePublicId: true,
  publishedAt: true,
  author: { select: { id: true, name: true } },
  categories: {
    select: {
      category: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.ArticleSelect;

export type ArticleWithRelations = Prisma.ArticleGetPayload<{
  include: typeof articleWithRelations;
}>;

export type ArticleListingItem = Prisma.ArticleGetPayload<{
  select: typeof articleListingSelect;
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
  options: { categoryIds?: string[] } = {},
  limit = 3,
) {
  const { categoryIds = [] } = options;
  const relatedFilter: Prisma.ArticleWhereInput[] = [];

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
  return { categories: { some: { category: { slug } } } };
}

function categoryIdWhere(categoryId: string): Prisma.ArticleWhereInput {
  return { categories: { some: { categoryId } } };
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
  authorId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  contentType?: "news" | "formation" | null;
  excludeArticleIds?: string[];
};

export function buildPublicArticleWhere(
  filters: PublicArticleFilters = {},
): Prisma.ArticleWhereInput {
  const conditions: Prisma.ArticleWhereInput[] = [publishedWhere()];

  if (filters.categorySlug) {
    conditions.push(categorySlugWhere(filters.categorySlug));
  }

  if (filters.authorId) {
    conditions.push({ authorId: filters.authorId });
  }

  if (filters.contentType === "news") {
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

export async function getFilteredPublishedArticles(
  filters: PublicArticleFilters,
  limit = 12,
  offset = 0,
  _options?: { newsFirst?: boolean },
) {
  return prisma.article.findMany({
    where: buildPublicArticleWhere(filters),
    include: articleWithRelations,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/** Liste publique légère (actualités, carrousels) — sans HTML `content`. */
export async function getFilteredPublishedArticlesForListing(
  filters: PublicArticleFilters,
  limit = 12,
  offset = 0,
) {
  return prisma.article.findMany({
    where: buildPublicArticleWhere(filters),
    select: articleListingSelect,
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip: offset,
  });
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

export async function getAdminArticleAuthors() {
  return prisma.user.findMany({
    where: { articles: { some: {} } },
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

  const article = await prisma.article.update({
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

  return article;
}

export async function archiveArticle(id: string) {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { updatedAt: true },
  });
  if (!existing) {
    throw new Error("Article introuvable");
  }

  // Keep updatedAt so a status-only change does not reorder the admin table
  // (sorted by "Modifié" / updatedAt desc).
  return prisma.article.update({
    where: { id },
    data: { status: ArticleStatus.ARCHIVED, updatedAt: existing.updatedAt },
  });
}

export async function republishArticle(id: string) {
  const existing = await prisma.article.findUnique({
    where: { id },
    select: { updatedAt: true },
  });
  if (!existing) {
    throw new Error("Article introuvable");
  }

  return prisma.article.update({
    where: { id },
    data: {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date(),
      updatedAt: existing.updatedAt,
    },
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

  const conditions: Prisma.ArticleWhereInput[] = [];

  if (filters.status) conditions.push({ status: filters.status });
  if (filters.authorId) conditions.push({ authorId: filters.authorId });
  if (filters.categoryId) conditions.push(categoryIdWhere(filters.categoryId));
  if (filters.search) {
    conditions.push({
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { excerpt: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.ArticleWhereInput =
    conditions.length === 0
      ? {}
      : conditions.length === 1
        ? conditions[0]
        : { AND: conditions };

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
