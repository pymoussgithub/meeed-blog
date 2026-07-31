import type { Metadata } from "next";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { ForumWriteGate } from "@/components/forum/ForumWriteGate";
import { NewTopicForm } from "@/components/forum/NewTopicForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedArticles } from "@/lib/services/article.service";
import { getActiveForumCategories } from "@/lib/services/forum-category.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ rubrique?: string; article?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Nouveau sujet — Forum",
  description: "Ouvrir une nouvelle discussion sur le forum MEEED.",
  path: "/forum/nouveau",
});

export default async function NewForumTopicPage({ searchParams }: PageProps) {
  const { rubrique, article: articleSlug } = await searchParams;
  const [categories, publishedArticles] = await Promise.all([
    getActiveForumCategories(),
    getPublishedArticles(48, 0),
  ]);
  const defaultCategoryId = rubrique
    ? categories.find((category) => category.slug === rubrique)?.id
    : undefined;
  const defaultArticleId = articleSlug
    ? publishedArticles.find((item) => item.slug === articleSlug)?.id
    : undefined;
  const defaultArticleIds = defaultArticleId ? [defaultArticleId] : undefined;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
    { name: "Nouveau sujet", path: "/forum/nouveau" },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />

      <ForumToolbar
        backHref="/forum"
        showSearch={false}
        newTopicHref={`/forum/nouveau${rubrique ? `?rubrique=${rubrique}` : ""}`}
      />

      <h1 className="mb-4 text-lg font-bold sm:text-xl">Nouveau sujet</h1>

      <ForumWriteGate callbackPath="/forum/nouveau">
        <NewTopicForm
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }))}
          articles={publishedArticles.map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            excerpt: item.excerpt,
            coverImageUrl: item.coverImageUrl,
            publishedAt: item.publishedAt?.toISOString() ?? null,
          }))}
          defaultCategoryId={defaultCategoryId}
          defaultArticleIds={defaultArticleIds}
        />
      </ForumWriteGate>
    </div>
  );
}
