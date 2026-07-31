import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForumTopicList } from "@/components/forum/ForumTopicList";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { FORUM_PAGE_SIZE, parseForumPage } from "@/lib/forum-listing";
import { getArticleBySlug } from "@/lib/services/article.service";
import {
  countForumTopicsForArticleSlug,
  getForumTopicsForArticleSlug,
} from "@/lib/services/forum-topic.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ articleSlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { articleSlug } = await params;

  try {
    const article = await getArticleBySlug(articleSlug);
    if (!article) return { title: "Article introuvable" };

    return buildPageMetadata({
      title: `Discussions — ${article.title}`,
      description: `Discussions du forum liées à l'article « ${article.title} ».`,
      path: `/forum/article/${article.slug}`,
    });
  } catch {
    return { title: "Discussions article" };
  }
}

export default async function ForumArticleTopicsPage({
  params,
  searchParams,
}: PageProps) {
  const { articleSlug } = await params;
  const { page } = await searchParams;
  const currentPage = parseForumPage(page);
  const offset = (currentPage - 1) * FORUM_PAGE_SIZE;

  const article = await getArticleBySlug(articleSlug);
  if (!article) {
    notFound();
  }

  const [topics, total] = await Promise.all([
    getForumTopicsForArticleSlug(article.slug, {
      limit: FORUM_PAGE_SIZE,
      offset,
    }),
    countForumTopicsForArticleSlug(article.slug),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / FORUM_PAGE_SIZE));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
    { name: article.title, path: `/forum/article/${article.slug}` },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />
      <ForumToolbar backHref="/forum" />
      <h1 className="mb-1 text-lg font-bold sm:text-xl">Discussions liées</h1>
      <p className="mb-3 text-xs text-primary/55">
        Article{" "}
        <a
          href={`/a/${article.slug}`}
          className="font-medium text-accent-dark hover:underline"
        >
          {article.title}
        </a>
      </p>
      <ForumTopicList
        topics={topics}
        showCategory
        emptyMessage="Aucune discussion liée à cet article."
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/forum/article/${article.slug}`}
      />
    </div>
  );
}
