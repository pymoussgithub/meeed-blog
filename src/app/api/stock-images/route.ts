import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUploadAuth } from "@/lib/auth-helpers";
import { searchStockImages } from "@/lib/stock-images";

const searchSchema = z.object({
  q: z.string().trim().min(1).max(120),
  page: z.coerce.number().int().min(1).max(50).default(1),
});

export async function GET(request: Request) {
  const auth = await requireUploadAuth();
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.parse({
      q: searchParams.get("q") ?? "",
      page: searchParams.get("page") ?? "1",
    });

    const result = await searchStockImages({
      query: parsed.q,
      page: parsed.page,
      pageSize: 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Impossible de rechercher des images.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
