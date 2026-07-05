import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "error" | "skipped";

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, CheckStatus> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (hasCloudinary) {
    try {
      const { pingCloudinary } = await import("@/lib/cloudinary");
      await pingCloudinary();
      checks.cloudinary = "ok";
    } catch {
      checks.cloudinary = "error";
    }
  } else {
    checks.cloudinary = "skipped";
  }

  const healthy = checks.database === "ok";

  return NextResponse.json(
    {
      status: healthy ? "ok" : "error",
      timestamp,
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
