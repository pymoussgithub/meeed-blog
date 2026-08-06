import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUploadAuth } from "@/lib/auth-helpers";
import { downloadStockImage } from "@/lib/stock-images";

const downloadSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  const auth = await requireUploadAuth();
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = downloadSchema.parse(await request.json());
    const downloaded = await downloadStockImage(body.url);

    return new NextResponse(Buffer.from(downloaded.buffer), {
      status: 200,
      headers: {
        "Content-Type": downloaded.contentType,
        "Content-Disposition": `attachment; filename="${downloaded.filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Impossible de télécharger l'image.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
