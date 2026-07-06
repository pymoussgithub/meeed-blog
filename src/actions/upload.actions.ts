"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { removeCloudinaryAsset } from "@/lib/services/upload.server";
import { actionError, actionSuccess, type ActionResult } from "@/types/actions";

function isAllowedImagePublicId(publicId: string) {
  return publicId.startsWith("meeed/articles/") || publicId.startsWith("meeed/projects/");
}

export async function deleteUploadedImageAction(
  publicId: string,
): Promise<ActionResult> {
  try {
    await requireAuth();

    if (!publicId.trim()) {
      return actionError("Identifiant d'image invalide");
    }

    if (!isAllowedImagePublicId(publicId)) {
      return actionError("Suppression non autorisée pour cette image");
    }

    await removeCloudinaryAsset(publicId, "image");
    return actionSuccess(undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
    return actionError(message);
  }
}
