"use server";

import type { DocumentVisibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  createDocument,
  deleteDocument,
  getDocumentById,
  updateDocument,
} from "@/lib/services/document.service";
import { createDocumentSchema } from "@/lib/validations/document";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

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

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

    return actionSuccess({ id: document.id });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de l'enregistrement");
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

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

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

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

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

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

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

export async function deleteDocumentAction(id: string): Promise<ActionResult<void>> {
  try {
    await assertCanManageDocument(id);
    await deleteDocument(id);

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(getErrorMessage(error, "Erreur lors de la suppression"));
  }
}
