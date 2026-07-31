import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildDocumentFolder,
  createSignedUploadParams,
  getCloudinaryPublicConfig,
} from "@/lib/cloudinary";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";
import { requireUploadAuth } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

const documentUploadSchema = z.object({
  articleId: z.string().cuid().optional(),
  documentId: z.string().cuid().optional(),
  fileName: z.string().min(1).max(255),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(UPLOAD_LIMITS.documentMaxBytes, "Fichier trop volumineux (max 25 Mo)"),
  mimeType: z.string().min(1).max(255),
});

export async function POST(request: Request) {
  const auth = await requireUploadAuth();
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = documentUploadSchema.parse(await request.json());
    const folder = buildDocumentFolder(body.documentId);
    const publicId = slugify(body.fileName.replace(/\.[^.]+$/i, "")) || "document";
    const { signature, timestamp } = createSignedUploadParams(folder, { public_id: publicId });
    const { cloudName, apiKey } = getCloudinaryPublicConfig();

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
      publicId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      limits: {
        maxBytes: UPLOAD_LIMITS.documentMaxBytes,
        mimeTypes: UPLOAD_LIMITS.documentMimeTypes,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Requête invalide", details: error.flatten() }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
