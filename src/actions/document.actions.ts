"use server";

import type { DocumentVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  archiveDocument,
  createDocument,
  deleteDocument,
  getDocumentById,
  restoreDocument,
  updateDocument,
} from "@/lib/services/document.service";
import {
  createDocumentSchema,
  updateDocumentMetaSchema,
} from "@/lib/validations/document";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

function revalidateDocumentPaths(id?: string) {
  revalidatePath("/admin/documents");
  revalidatePath("/documents");
  if (id) {
    revalidatePath(`/admin/documents/${id}`);
  }
}

export async function createDocumentAction(input: {
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryPublicId: string;
  articleId?: string | null;
  projectId?: string | null;
  visibility?: DocumentVisibility;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();

    const parsed = createDocumentSchema.safeParse({
      ...input,
      uploadedById: user.id,
      visibility: input.visibility ?? "PUBLIC",
    });

    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const document = await createDocument(parsed.data);

    revalidateDocumentPaths(document.id);

    return actionSuccess({ id: document.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
  }
}

export async function updateDocumentAction(
  id: string,
  input: {
    title: string;
    description?: string | null;
    visibility: DocumentVisibility;
    articleId?: string | null;
    projectId?: string | null;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    cloudinaryPublicId?: string;
  },
): Promise<ActionResult> {
  try {
    await assertCanManageDocument(id);

    const parsed = updateDocumentMetaSchema.safeParse(input);
    if (!parsed.success) {
      return actionError(parsed.error.errors[0]?.message ?? "Données invalides");
    }

    const {
      title,
      description,
      visibility,
      articleId,
      projectId,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      cloudinaryPublicId,
    } = parsed.data;

    let nextArticleId = articleId ?? null;
    let nextProjectId = projectId ?? null;

    if (nextArticleId) {
      const article = await prisma.article.findUnique({
        where: { id: nextArticleId },
        select: { id: true, projectId: true },
      });

      if (!article) {
        return actionError("Article introuvable");
      }

      nextArticleId = article.id;
      nextProjectId = article.projectId;
    }

    await updateDocument(id, {
      title,
      description,
      visibility,
      articleId: nextArticleId,
      projectId: nextProjectId,
      ...(fileUrl ? { fileUrl } : {}),
      ...(fileName ? { fileName } : {}),
      ...(fileSize ? { fileSize } : {}),
      ...(mimeType ? { mimeType } : {}),
      ...(cloudinaryPublicId ? { cloudinaryPublicId } : {}),
    });

    revalidateDocumentPaths(id);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getErrorMessage(error, "Erreur lors de la mise à jour"));
  }
}

export async function setDocumentVisibilityAction(
  id: string,
  visibility: DocumentVisibility,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const document = await getDocumentById(id);

    if (!document) {
      return actionError("Document introuvable");
    }

    if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
      return actionError("Non autorisé");
    }

    await updateDocument(id, { visibility });

    revalidateDocumentPaths(id);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function linkDocumentToArticleAction(
  id: string,
  articleId: string | null,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const document = await getDocumentById(id);

    if (!document) {
      return actionError("Document introuvable");
    }

    if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
      return actionError("Non autorisé");
    }

    if (!articleId) {
      await updateDocument(id, { articleId: null });
    } else {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true, projectId: true },
      });

      if (!article) {
        return actionError("Article introuvable");
      }

      // Le projet du document suit automatiquement celui de l'article lié.
      await updateDocument(id, {
        articleId: article.id,
        projectId: article.projectId,
      });
    }

    revalidateDocumentPaths(id);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

export async function linkDocumentToProjectAction(
  id: string,
  projectId: string | null,
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const document = await getDocumentById(id);

    if (!document) {
      return actionError("Document introuvable");
    }

    if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
      return actionError("Non autorisé");
    }

    if (document.articleId) {
      return actionError(
        "Le projet est défini par l’article lié. Dissociez l’article pour choisir un projet manuellement.",
      );
    }

    await updateDocument(id, { projectId });

    revalidateDocumentPaths(id);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur");
  }
}

async function assertCanManageDocument(documentId: string) {
  const user = await requireAuth();
  const document = await getDocumentById(documentId);

  if (!document) {
    throw new Error("Document introuvable");
  }

  if (user.role !== "ADMIN" && document.uploadedById !== user.id) {
    throw new Error("Non autorisé");
  }

  return { user, document };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    (error as { error: unknown }).error instanceof Error
  ) {
    return ((error as { error: Error }).error).message || fallback;
  }

  return fallback;
}

export async function archiveDocumentAction(id: string): Promise<ActionResult<void>> {
  try {
    const { document } = await assertCanManageDocument(id);

    if (document.isArchived) {
      return actionError("Ce document est déjà archivé");
    }

    await archiveDocument(id);
    revalidateDocumentPaths(id);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getErrorMessage(error, "Erreur lors de l'archivage"));
  }
}

export async function restoreDocumentAction(id: string): Promise<ActionResult<void>> {
  try {
    const { document } = await assertCanManageDocument(id);

    if (!document.isArchived) {
      return actionError("Seuls les documents archivés peuvent être restaurés");
    }

    await restoreDocument(id);
    revalidateDocumentPaths(id);

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getErrorMessage(error, "Erreur lors de la restauration"));
  }
}

export async function deleteDocumentAction(id: string): Promise<ActionResult<void>> {
  try {
    const { document } = await assertCanManageDocument(id);

    if (!document.isArchived) {
      return actionError(
        "Seuls les documents archivés peuvent être supprimés. Archivez d'abord le document.",
      );
    }

    await deleteDocument(id);

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getErrorMessage(error, "Erreur lors de la suppression"));
  }
}
