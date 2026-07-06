import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { ShareBar } from "@/components/article/ShareBar";
import { DocumentList } from "@/components/document/DocumentList";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getArticleBySlug,
  getSimilarArticles,
} from "@/lib/services/article.service";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  getArticleOgImage,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticleBySlug(slug);

    if (!article) {
      return { title: "Article introuvable" };
    }

    return buildPageMetadata({
      title: article.title,
      description: article.excerpt,
      path: `/a/${article.slug}`,
      image: getArticleOgImage(article),
      type: "article",
    });
  } catch {
    return { title: "Article" };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const categoryIds = article.categories.map((item) => item.categoryId);
  const similarArticles = await getSimilarArticles(article.id, categoryIds, 3);
  const articleUrl = absoluteUrl(`/a/${article.slug}`);
  const primaryCategory = article.categories[0]?.category;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    ...(primaryCategory
      ? [{ name: primaryCategory.name, path: `/c/${primaryCategory.slug}` }]
      : []),
    { name: article.title, path: `/a/${article.slug}` },
  ]);

  return (
    <article className="container-meeed py-8 sm:py-12">
      <JsonLd
        data={[
          buildArticleJsonLd({
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            coverImageUrl: article.coverImageUrl,
            coverImagePublicId: article.coverImagePublicId,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
            authorName: article.author.name,
          }),
          breadcrumb,
        ]}
      />

      <header className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
        <div className="mt-4">
          <ArticleMeta article={article} />
        </div>
      </header>

      <div className="mx-auto mt-6 max-w-3xl">
        <ArticleHero article={article} />
      </div>

      <div className="mx-auto mt-8 max-w-3xl">
        <ArticleContent html={article.content} />
        <DocumentList documents={article.documents} />
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        <ShareBar title={article.title} url={articleUrl} />
      </div>

      {similarArticles.length > 0 ? (
        <section className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="mb-6 text-2xl font-bold">Articles similaires</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similarArticles.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
