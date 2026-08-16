import type { Metadata } from "next";
import { ForumAccessGate } from "@/components/forum/ForumAccessGate";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Accès au forum",
  description:
    "Pour participer au forum, connectez-vous ou créez un compte.",
  path: "/forum/acces",
});

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function ForumAccessPage({ searchParams }: PageProps) {
  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/forum";

  return <ForumAccessGate callbackPath={safeCallback} />;
}
