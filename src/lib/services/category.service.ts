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

export async function getCategoriesForAdmin() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      project: { select: { id: true, title: true } },
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
      articles: {
        some: {
          article: publishedArticleWhere(),
        },
      },
    },
    orderBy: { sortOrder: "asc" },
    include: {
      project: { select: { slug: true, isActive: true } },
    },
  });
}

export async function getCategoriesForArticleForm(selectedCategoryIds: string[] = []) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      project: { select: { isActive: true } },
    },
  });

  return categories
    .filter(
      (category) =>
        !category.project ||
        category.project.isActive ||
        selectedCategoryIds.includes(category.id),
    )
    .map(({ project, ...category }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      isProject: Boolean(project),
    }));
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      project: { select: { id: true, title: true, slug: true, isActive: true } },
    },
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

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      project: { select: { id: true } },
      articles: {
        where: { article: publishedArticleWhere() },
        select: { articleId: true },
      },
    },
  });

  if (!category) {
    throw new Error("Catégorie introuvable");
  }

  if (category.project) {
    throw new Error("Supprimez d'abord le projet associé à cette catégorie");
  }

  if (category.articles.length > 0) {
    throw new Error("Impossible de supprimer une catégorie contenant des articles publiés");
  }

  return prisma.category.delete({ where: { id } });
}
