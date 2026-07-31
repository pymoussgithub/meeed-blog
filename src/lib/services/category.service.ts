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
      projects: {
        select: {
          id: true,
          title: true,
          _count: { select: { articles: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
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
      OR: [
        {
          articles: {
            some: {
              article: publishedArticleWhere(),
            },
          },
        },
        {
          projects: {
            some: {
              articles: {
                some: publishedArticleWhere(),
              },
            },
          },
        },
      ],
    },
    orderBy: { sortOrder: "asc" },
    include: {
      projects: { select: { slug: true, isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getCategoriesForArticleForm(selectedCategoryIds: string[] = []) {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      projects: { select: { id: true } },
    },
  });

  return categories
    .filter(
      (category) =>
        category.projects.length === 0 || selectedCategoryIds.includes(category.id),
    )
    .map(({ projects: _projects, ...category }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
}

export async function getProjectsForArticleForm(selectedProjectId?: string | null) {
  return prisma.project.findMany({
    where: {
      OR: [{ isActive: true }, ...(selectedProjectId ? [{ id: selectedProjectId }] : [])],
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      color: true,
      isActive: true,
      category: { select: { name: true } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      projects: {
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          color: true,
          isActive: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      },
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
    throw new Error("Liste de catégories invalide pour le réordonnancement");
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
      projects: { select: { id: true } },
      articles: {
        where: { article: publishedArticleWhere() },
        select: { articleId: true },
      },
    },
  });

  if (!category) {
    throw new Error("Catégorie introuvable");
  }

  if (category.projects.length > 0) {
    throw new Error("Supprimez d'abord les projets associés à cette catégorie");
  }

  if (category.articles.length > 0) {
    throw new Error("Impossible de supprimer une catégorie contenant des articles publiés");
  }

  return prisma.category.delete({ where: { id } });
}
