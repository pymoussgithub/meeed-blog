import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project";

const projectWithCategory = {
  category: true,
} as const;

const publishedArticleCoverWhere: Prisma.ArticleWhereInput = {
  status: ArticleStatus.PUBLISHED,
  OR: [{ coverImagePublicId: { not: null } }, { coverImageUrl: { not: null } }],
};

const projectWithCategoryAndCover = {
  category: true,
  articles: {
    where: publishedArticleCoverWhere,
    orderBy: { publishedAt: Prisma.SortOrder.desc },
    take: 1,
    select: {
      coverImagePublicId: true,
      coverImageUrl: true,
    },
  },
  _count: {
    select: {
      articles: {
        where: { status: ArticleStatus.PUBLISHED },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectWithCategory = Awaited<ReturnType<typeof getAllProjectsForAdmin>>[number];
export type ActiveProject = Awaited<ReturnType<typeof getActiveProjects>>[number];

export async function getActiveProjects() {
  return prisma.project.findMany({
    where: { isActive: true },
    include: projectWithCategoryAndCover,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAllProjectsForAdmin() {
  return prisma.project.findMany({
    include: {
      category: true,
      articles: {
        where: publishedArticleCoverWhere,
        orderBy: { publishedAt: Prisma.SortOrder.desc },
        take: 1,
        select: {
          coverImagePublicId: true,
          coverImageUrl: true,
        },
      },
      _count: { select: { articles: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: projectWithCategory,
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: projectWithCategory,
  });
}

export async function isProjectSlugTaken(slug: string, excludeProjectId?: string) {
  const project = await prisma.project.findUnique({ where: { slug } });
  return Boolean(project && project.id !== excludeProjectId);
}

export async function getCategoriesAvailableForProject() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

async function assertCategoryExists(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new Error("Catégorie introuvable");
  }

  return category;
}

export async function createProject(data: CreateProjectInput) {
  await assertCategoryExists(data.categoryId);

  return prisma.project.create({
    data: {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      description: data.description ?? null,
      donationUrl: data.donationUrl || null,
      coverImageUrl: data.coverImageUrl ?? null,
      coverImagePublicId: data.coverImagePublicId ?? null,
      color: data.color ?? "#4ecdc4",
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      categoryId: data.categoryId,
    },
    include: projectWithCategory,
  });
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  const existing = await getProjectById(id);
  if (!existing) {
    throw new Error("Projet introuvable");
  }

  if (data.categoryId !== undefined) {
    await assertCategoryExists(data.categoryId);
  }

  return prisma.project.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.summary !== undefined ? { summary: data.summary } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.donationUrl !== undefined ? { donationUrl: data.donationUrl || null } : {}),
      ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
      ...(data.coverImagePublicId !== undefined
        ? { coverImagePublicId: data.coverImagePublicId }
        : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
    },
    include: projectWithCategory,
  });
}

export async function reorderProjects(orderedIds: string[]) {
  const existing = await prisma.project.findMany({
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });
  const existingIds = new Set(existing.map((project) => project.id));

  if (
    orderedIds.length !== existing.length ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Liste de projets invalide pour le réordonnancement");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function countProjectArticles(projectId: string) {
  return prisma.article.count({
    where: {
      projectId,
      status: ArticleStatus.PUBLISHED,
    },
  });
}

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      documents: {
        select: { id: true, cloudinaryPublicId: true },
      },
    },
  });

  if (!project) {
    throw new Error("Projet introuvable");
  }

  if (project.coverImagePublicId) {
    await removeCloudinaryAsset(project.coverImagePublicId, "image");
  }

  for (const document of project.documents) {
    await removeCloudinaryAsset(document.cloudinaryPublicId, "raw");
  }

  await prisma.$transaction(async (tx) => {
    if (project.documents.length > 0) {
      await tx.document.deleteMany({ where: { projectId: id } });
    }

    await tx.project.delete({ where: { id } });
  });
}
