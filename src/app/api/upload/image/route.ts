import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildImageFolder,
  buildProjectImageFolder,
  createSignedUploadParams,
  getCloudinaryPublicConfig,
} from "@/lib/cloudinary";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";
import { requireUploadAuth } from "@/lib/auth-helpers";

const imageUploadSchema = z.object({
  purpose: z.enum(["cover", "inline", "project-cover"]).default("cover"),
  articleId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
});

export async function POST(request: Request) {
  const auth = await requireUploadAuth();
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = imageUploadSchema.parse(await request.json());
    const folder =
      body.purpose === "project-cover"
        ? buildProjectImageFolder(body.projectId)
        : buildImageFolder(body.purpose, body.articleId);
    const { signature, timestamp } = createSignedUploadParams(folder);
    const { cloudName, apiKey } = getCloudinaryPublicConfig();

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      limits: {
        maxBytes: UPLOAD_LIMITS.imageMaxBytes,
        mimeTypes: UPLOAD_LIMITS.imageMimeTypes,
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
