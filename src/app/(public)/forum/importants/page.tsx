import type { Metadata } from "next";
import { ForumTopicList } from "@/components/forum/ForumTopicList";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { FORUM_PAGE_SIZE, parseForumPage } from "@/lib/forum-listing";
import {
  countPinnedForumTopics,
  getPinnedForumTopics,
} from "@/lib/services/forum-topic.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Sujets importants — Forum",
  description: "Sujets épinglés et mis en avant sur le forum MEEED.",
  path: "/forum/importants",
});

export default async function ForumImportantsPage({ searchParams }: PageProps) {
  const { page } = await searchParams;
  const currentPage = parseForumPage(page);
  const offset = (currentPage - 1) * FORUM_PAGE_SIZE;

  const [topics, total] = await Promise.all([
    getPinnedForumTopics(FORUM_PAGE_SIZE, offset),
    countPinnedForumTopics(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / FORUM_PAGE_SIZE));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
    { name: "Importants", path: "/forum/importants" },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />
      <ForumToolbar backHref="/forum" />
      <h1 className="mb-3 text-lg font-bold sm:text-xl">Sujets importants</h1>
      <ForumTopicList
        topics={topics}
        showCategory
        emptyMessage="Aucun sujet épinglé pour le moment."
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/forum/importants"
      />
    </div>
  );
}
