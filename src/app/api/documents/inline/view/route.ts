import { NextResponse } from "next/server";
import { getDocumentViewUrl } from "@/lib/cloudinary";
import { isAllowedInlineDocumentPublicId } from "@/lib/inline-document";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicId = searchParams.get("publicId")?.trim() ?? "";
  const format = searchParams.get("format")?.trim() || "pdf";

  if (!isAllowedInlineDocumentPublicId(publicId)) {
    return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  }

  try {
    const viewUrl = getDocumentViewUrl(publicId, format);
    return NextResponse.redirect(viewUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
