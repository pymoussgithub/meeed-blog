import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import type { CreateDocumentInput, UpdateDocumentInput } from "@/lib/validations/document";

export type PublicDocumentFilters = {
  search?: string | null;
  projectSlug?: string | null;
  categorySlug?: string | null;
  uploaderId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  linked?: "article" | "project" | "no" | null;
};

const publicDocumentInclude = {
  article: {
    select: {
      id: true,
      title: true,
      slug: true,
      categories: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              project: {
                select: { id: true, title: true, slug: true },
              },
            },
          },
        },
      },
    },
  },
  project: { select: { id: true, title: true, slug: true } },
  uploadedBy: { select: { id: true, name: true } },
} as const;

function appendAnd(
  where: Prisma.DocumentWhereInput,
  condition: Prisma.DocumentWhereInput,
) {
  const existing = where.AND;
  where.AND = Array.isArray(existing)
    ? [...existing, condition]
    : existing
      ? [existing, condition]
      : [condition];
}

function buildPublicDocumentWhere(filters: PublicDocumentFilters): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = {
    isPublic: true,
  };

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.linked === "article") {
    where.articleId = { not: null };
  } else if (filters.linked === "project") {
    where.projectId = { not: null };
  } else if (filters.linked === "no") {
    where.articleId = null;
    where.projectId = null;
  }

  if (filters.uploaderId) {
    where.uploadedById = filters.uploaderId;
  }

  if (filters.dateFrom || filters.dateTo) {
    const createdAt: Prisma.DateTimeFilter = {};
    if (filters.dateFrom) {
      createdAt.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      createdAt.lte = end;
    }
    where.createdAt = createdAt;
  }

  if (filters.projectSlug) {
    appendAnd(where, {
      OR: [
        { project: { slug: filters.projectSlug, isActive: true } },
        {
          article: {
            categories: {
              some: {
                category: {
                  project: { slug: filters.projectSlug, isActive: true },
                },
              },
            },
          },
        },
      ],
    });
  }

  if (filters.categorySlug) {
    appendAnd(where, {
      article: {
        categories: {
          some: {
            category: { slug: filters.categorySlug, project: null },
          },
        },
      },
    });
  }

  return where;
}

export async function getPublicDocuments(filters: PublicDocumentFilters = {}) {
  return prisma.document.findMany({
    where: buildPublicDocumentWhere(filters),
    orderBy: { createdAt: "desc" },
    include: publicDocumentInclude,
  });
}

export async function countPublicDocuments(filters: PublicDocumentFilters = {}) {
  return prisma.document.count({
    where: buildPublicDocumentWhere(filters),
  });
}

export async function getPublicDocumentUploaders() {
  return prisma.user.findMany({
    where: {
      documents: { some: { isPublic: true } },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getPublicDocumentNewsCategories() {
  return prisma.category.findMany({
    where: {
      project: null,
      articles: {
        some: {
          article: {
            documents: { some: { isPublic: true } },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getPublicDocumentProjects() {
  return prisma.project.findMany({
    where: {
      isActive: true,
      OR: [
        { documents: { some: { isPublic: true } } },
        {
          category: {
            articles: {
              some: {
                article: {
                  documents: { some: { isPublic: true } },
                },
              },
            },
          },
        },
      ],
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, title: true, slug: true },
  });
}

export async function getDocumentsByArticle(articleId: string) {
  return prisma.document.findMany({
    where: { articleId, isPublic: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDocumentsByProject(projectId: string) {
  return prisma.document.findMany({
    where: { projectId, isPublic: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createDocument(data: CreateDocumentInput) {
  return prisma.document.create({ data });
}

export async function updateDocument(id: string, data: UpdateDocumentInput) {
  return prisma.document.update({
    where: { id },
    data,
  });
}

export async function getAllDocuments(userId?: string, isAdmin = true) {
  return prisma.document.findMany({
    where: isAdmin || !userId ? {} : { uploadedById: userId },
    orderBy: { createdAt: "desc" },
    include: {
      article: { select: { id: true, title: true, slug: true } },
      project: { select: { id: true, title: true, slug: true } },
      uploadedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
    select: { cloudinaryPublicId: true },
  });

  if (!document) {
    throw new Error("Document introuvable");
  }

  await removeCloudinaryAsset(document.cloudinaryPublicId, "raw");

  return prisma.document.delete({ where: { id } });
}
