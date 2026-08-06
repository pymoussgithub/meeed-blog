import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category";

function publishedArticleWhere() {
  return {
    status: ArticleStatus.PUBLISHED,
    publishedAt: { lte: new Date() },
  };
}

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

/** Domaines publics avec le nombre d’articles publiés par domaine. */
export async function getCategoriesWithPublishedCounts() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          articles: {
            where: { article: publishedArticleWhere() },
          },
        },
      },
    },
  });
}

export async function getCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      articles: {
        where: { article: publishedArticleWhere() },
        select: { articleId: true },
      },
      _count: { select: { articles: true } },
    },
  });
}

export async function getPublishedCategories() {
  return prisma.category.findMany({
    where: {
      articles: { some: { article: publishedArticleWhere() } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoriesForArticleForm() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(data: CreateCategoryInput) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data,
  });
}

export async function reorderCategories(orderedIds: string[]) {
  const existing = await prisma.category.findMany({
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });
  const existingIds = new Set(existing.map((category) => category.id));

  if (
    orderedIds.length !== existing.length ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Liste de domaines invalide pour le réordonnancement");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      articles: {
        where: { article: publishedArticleWhere() },
        select: { articleId: true },
      },
    },
  });

  if (!category) {
    throw new Error("Domaine introuvable");
  }

  if (category.articles.length > 0) {
    throw new Error("Impossible de supprimer un domaine contenant des articles publiés");
  }

  return prisma.category.delete({ where: { id } });
}
