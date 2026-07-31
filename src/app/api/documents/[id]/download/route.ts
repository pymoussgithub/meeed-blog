import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDocumentDownloadUrl } from "@/lib/cloudinary";
import { getDocumentById } from "@/lib/services/document.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const document = await getDocumentById(id);

  if (!document) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  const user = await getCurrentUser();
  const canAccess =
    document.visibility === "PUBLIC" ||
    user?.role === "ADMIN" ||
    user?.id === document.uploadedById ||
    (document.visibility === "CONTRIBUTOR" && Boolean(user));

  if (!canAccess) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const downloadUrl = getDocumentDownloadUrl(document.cloudinaryPublicId);

  return NextResponse.redirect(downloadUrl);
}
