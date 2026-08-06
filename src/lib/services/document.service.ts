import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import type { CreateDocumentInput, UpdateDocumentInput } from "@/lib/validations/document";

export type DocumentAccessUser = {
  id: string;
  role: "ADMIN" | "CONTRIBUTEUR";
};

export type PublicDocumentFilters = {
  search?: string | null;
  categorySlug?: string | null;
  uploaderId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  linked?: "article" | "no" | null;
};

export const publicDocumentInclude = {
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
            },
          },
        },
      },
    },
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  uploadedBy: { select: { id: true, name: true } },
} as const;

export function buildDocumentAccessWhere(
  user?: DocumentAccessUser | null,
): Prisma.DocumentWhereInput {
  const notArchived: Prisma.DocumentWhereInput = { isArchived: false };

  if (user?.role === "ADMIN") {
    return notArchived;
  }

  if (user) {
    return {
      AND: [
        notArchived,
        {
          OR: [
            { visibility: "PUBLIC" },
            { visibility: "CONTRIBUTOR" },
          ],
        },
      ],
    };
  }

  return { ...notArchived, visibility: "PUBLIC" };
}

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

function buildAccessibleDocumentWhere(
  filters: PublicDocumentFilters,
  user?: DocumentAccessUser | null,
): Prisma.DocumentWhereInput {
  const where: Prisma.DocumentWhereInput = buildDocumentAccessWhere(user);

  if (filters.search) {
    appendAnd(where, {
      OR: [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  if (filters.linked === "article") {
    where.articleId = { not: null };
  } else if (filters.linked === "no") {
    where.articleId = null;
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

  if (filters.categorySlug) {
    appendAnd(where, {
      OR: [
        { category: { slug: filters.categorySlug } },
        {
          article: {
            categories: { some: { category: { slug: filters.categorySlug } } },
          },
        },
      ],
    });
  }

  return where;
}

export async function getPublicDocuments(
  filters: PublicDocumentFilters = {},
  user?: DocumentAccessUser | null,
) {
  return prisma.document.findMany({
    where: buildAccessibleDocumentWhere(filters, user),
    orderBy: { createdAt: "desc" },
    include: publicDocumentInclude,
  });
}

export async function countPublicDocuments(
  filters: PublicDocumentFilters = {},
  user?: DocumentAccessUser | null,
) {
  return prisma.document.count({
    where: buildAccessibleDocumentWhere(filters, user),
  });
}

export async function getPublicDocumentUploaders(user?: DocumentAccessUser | null) {
  return prisma.user.findMany({
    where: {
      documents: { some: buildDocumentAccessWhere(user) },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getPublicDocumentNewsCategories(user?: DocumentAccessUser | null) {
  const accessibleDocumentsWhere = buildDocumentAccessWhere(user);

  return prisma.category.findMany({
    where: {
      OR: [
        { documents: { some: accessibleDocumentsWhere } },
        {
          articles: {
            some: {
              article: {
                documents: { some: accessibleDocumentsWhere },
              },
            },
          },
        },
      ],
    },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });
}

export async function getDocumentsByArticle(articleId: string, user?: DocumentAccessUser | null) {
  return prisma.document.findMany({
    where: { articleId, ...buildDocumentAccessWhere(user) },
    include: publicDocumentInclude,
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
                },
              },
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      uploadedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({ where: { id } });
}

export async function getDocumentByIdForAdmin(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      uploadedBy: { select: { id: true, name: true } },
    },
  });
}

export async function archiveDocument(id: string) {
  return prisma.document.update({
    where: { id },
    data: { isArchived: true },
  });
}

export async function restoreDocument(id: string) {
  return prisma.document.update({
    where: { id },
    data: { isArchived: false },
  });
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.findUnique({
    where: { id },
    select: { cloudinaryPublicId: true },
  });

  if (!document) {
    throw new Error("Document introuvable");
  }

  try {
    await removeCloudinaryAsset(document.cloudinaryPublicId, "raw");
  } catch (error) {
    // Ne pas bloquer la suppression en base si Cloudinary est indisponible
    // (TLS/proxy, fichier déjà absent, etc.).
    console.error(
      `[documents] Échec suppression Cloudinary (${document.cloudinaryPublicId}):`,
      error,
    );
  }

  return prisma.document.delete({ where: { id } });
}
