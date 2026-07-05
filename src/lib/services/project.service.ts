import { ArticleStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/validations/project";

const projectWithCategory = {
  category: true,
} as const;

const projectWithCategoryAndCover = {
  category: {
    include: {
      articles: {
        where: {
          article: {
            status: ArticleStatus.PUBLISHED,
            OR: [{ coverImagePublicId: { not: null } }, { coverImageUrl: { not: null } }],
          },
        },
        orderBy: { article: { publishedAt: Prisma.SortOrder.desc } },
        take: 1,
        select: {
          article: {
            select: {
              coverImagePublicId: true,
              coverImageUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          articles: {
            where: { article: { status: ArticleStatus.PUBLISHED } },
          },
        },
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
      category: {
        include: {
          _count: { select: { articles: true } },
        },
      },
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
  const [project, category] = await Promise.all([
    prisma.project.findUnique({ where: { slug } }),
    prisma.category.findUnique({ where: { slug } }),
  ]);

  if (project && project.id !== excludeProjectId) {
    return true;
  }

  if (category) {
    const linkedProject = await prisma.project.findUnique({
      where: { categoryId: category.id },
    });
    if (linkedProject && linkedProject.id !== excludeProjectId) {
      return true;
    }
    if (!linkedProject) {
      return true;
    }
  }

  return false;
}

export async function createProject(data: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    const category = await tx.category.create({
      data: {
        name: data.title,
        slug: data.slug,
        description: data.summary,
        color: data.color ?? "#4ecdc4",
        sortOrder: data.sortOrder,
      },
    });

    return tx.project.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        description: data.description ?? null,
        donationUrl: data.donationUrl || null,
        color: data.color ?? "#4ecdc4",
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        categoryId: category.id,
      },
      include: projectWithCategory,
    });
  });
}

export async function updateProject(id: string, data: UpdateProjectInput) {
  const existing = await getProjectById(id);
  if (!existing) {
    throw new Error("Projet introuvable");
  }

  return prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { id: existing.categoryId },
      data: {
        ...(data.title !== undefined ? { name: data.title } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.summary !== undefined ? { description: data.summary } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });

    return tx.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.summary !== undefined ? { summary: data.summary } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.donationUrl !== undefined ? { donationUrl: data.donationUrl || null } : {}),
        ...(data.color !== undefined ? { color: data.color } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
      include: projectWithCategory,
    });
  });
}

export async function countProjectArticles(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      category: {
        select: { _count: { select: { articles: true } } },
      },
    },
  });

  return project?.category._count.articles ?? 0;
}

export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      category: {
        include: {
          articles: {
            include: {
              article: {
                select: {
                  id: true,
                  coverImagePublicId: true,
                  documents: {
                    select: { id: true, cloudinaryPublicId: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Projet introuvable");
  }

  const articles = project.category.articles.map((link) => link.article);
  const articleIds = articles.map((article) => article.id);

  for (const article of articles) {
    if (article.coverImagePublicId) {
      await removeCloudinaryAsset(article.coverImagePublicId, "image");
    }

    for (const document of article.documents) {
      await removeCloudinaryAsset(document.cloudinaryPublicId, "raw");
    }
  }

  await prisma.$transaction(async (tx) => {
    if (articleIds.length > 0) {
      await tx.document.deleteMany({ where: { articleId: { in: articleIds } } });
      await tx.article.deleteMany({ where: { id: { in: articleIds } } });
    }

    await tx.project.delete({ where: { id } });
    await tx.category.delete({ where: { id: project.categoryId } });
  });
}
