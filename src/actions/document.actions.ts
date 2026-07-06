"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-helpers";
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
  cloudinaryPublicId: string;
  articleId?: string | null;
  projectId?: string | null;
  isPublic?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();

    const parsed = createDocumentSchema.safeParse({
      ...input,
      mimeType: "application/pdf",
      uploadedById: user.id,
      isPublic: input.isPublic ?? true,
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

export async function toggleDocumentPublicAction(
  id: string,
  isPublic: boolean,
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

    await updateDocument(id, { isPublic });

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

    await updateDocument(id, { articleId });

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

export async function deleteDocumentAction(id: string): Promise<ActionResult<void>> {
  try {
    await assertCanManageDocument(id);
    await deleteDocument(id);

    revalidatePath("/admin/documents");
    revalidatePath("/documents");

    return actionSuccess(undefined);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erreur lors de la suppression");
  }
}
