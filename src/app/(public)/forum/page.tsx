import type { Metadata } from "next";
import { ForumCategoryTable } from "@/components/forum/ForumCategoryTable";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getForumHomeIndex } from "@/lib/services/forum-category.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Forum",
  description:
    "Échangez autour des projets MEEED, posez vos questionnement à la communauté MEEED et  trouvez des réponses dans les discussions de la communauté.",
  path: "/forum",
});

export default async function ForumHomePage() {
  let rows: Awaited<ReturnType<typeof getForumHomeIndex>> = [];
  let dbError = false;

  try {
    rows = await getForumHomeIndex();
  } catch {
    dbError = true;
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />
      <h1 className="sr-only">Forum</h1>

      <ForumToolbar items={[{ label: "Forum" }]} />

      {dbError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Base de données non connectée. Lancez PostgreSQL puis{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:migrate</code>.
        </p>
      ) : (
        <ForumCategoryTable rows={rows} />
      )}
    </div>
  );
}
