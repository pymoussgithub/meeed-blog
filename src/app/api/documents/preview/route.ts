import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUploadAuth } from "@/lib/auth-helpers";
import { getDocumentDownloadUrl } from "@/lib/cloudinary";

const previewSchema = z.object({
  publicId: z.string().min(1),
});

export async function POST(request: Request) {
  const auth = await requireUploadAuth();
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = previewSchema.parse(await request.json());
    const downloadUrl = getDocumentDownloadUrl(body.publicId);

    return NextResponse.json({ url: downloadUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
