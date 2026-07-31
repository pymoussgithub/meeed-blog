import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "error" | "skipped";

function isLocalSiteUrl() {
  const siteUrl = process.env.NEXTAUTH_URL;
  if (!siteUrl) return false;

  try {
    const hostname = new URL(siteUrl).hostname;
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname);
  } catch {
    return false;
  }
}

function isCloudinaryHealthcheckEnabled() {
  const override = process.env.CLOUDINARY_HEALTHCHECK_ENABLED;
  if (override === "true" || override === "1") return true;
  if (override === "false" || override === "0") return false;
  if (isLocalSiteUrl()) return false;
  return process.env.NODE_ENV === "production";
}

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

  if (hasCloudinary && isCloudinaryHealthcheckEnabled()) {
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
