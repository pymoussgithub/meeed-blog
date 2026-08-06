import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ArticleHero } from "@/components/article/ArticleHero";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { DocumentList } from "@/components/document/DocumentList";
import { ForumTopicList } from "@/components/forum/ForumTopicList";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  getArticleBySlug,
  getSimilarArticles,
} from "@/lib/services/article.service";
import { getForumTopicsForArticleSlug } from "@/lib/services/forum-topic.service";
import {
  absoluteUrl,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  getArticleOgImage,
} from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ returnTo?: string }>;
};

function resolveArticlesReturnHref(returnTo?: string) {
  if (!returnTo) return "/actualites";
  if (!returnTo.startsWith("/actualites")) return "/actualites";
  if (returnTo.startsWith("//")) return "/actualites";
  return returnTo;
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

export default async function ArticlePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { returnTo } = await searchParams;
  const user = await getCurrentUser();
  const article = await getArticleBySlug(slug, user);

  if (!article) {
    notFound();
  }

  const [similarArticles, forumTopics] = await Promise.all([
    getSimilarArticles(
      article.id,
      {
        categoryIds: article.categories.map((item) => item.categoryId),
      },
      3,
    ),
    getForumTopicsForArticleSlug(article.slug),
  ]);
  const articleUrl = absoluteUrl(`/a/${article.slug}`);
  const primaryCategory = article.categories[0]?.category;
  const backHref = resolveArticlesReturnHref(returnTo);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    ...(primaryCategory ? [{ name: primaryCategory.name, path: `/c/${primaryCategory.slug}` }] : []),
    { name: article.title, path: `/a/${article.slug}` },
  ]);

  return (
    <article className="container-meeed py-4 sm:py-5">
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

      <div className="mb-4 border-b border-primary/10 pb-3">
        <Link
          href={backHref}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/15 bg-white px-3 text-sm font-semibold text-primary shadow-sm transition-all hover:border-accent/50 hover:bg-bg-soft/60 hover:text-accent-dark"
        >
          <BackIcon className="h-3.5 w-3.5 shrink-0 text-accent-dark" />
          Retour
        </Link>
      </div>

      <header className="mx-auto max-w-3xl pt-6 sm:pt-8" data-tour-id="article.header">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{article.title}</h1>
        <div className="mt-4">
          <ArticleMeta
            article={article}
            shareTitle={article.title}
            shareUrl={articleUrl}
          />
        </div>
      </header>

      <div className="mx-auto mt-6 max-w-3xl">
        <ArticleHero article={article} />
      </div>

      <div className="mx-auto mt-8 max-w-3xl" data-tour-id="article.body">
        <ArticleContent html={article.content} />
        <div data-tour-id={article.documents.length > 0 ? "article.documents" : undefined}>
          <DocumentList documents={article.documents} hideArticleLink />
        </div>
      </div>

      {forumTopics.length > 0 ? (
        <section
          aria-labelledby="article-forum-discussions"
          className="mt-10"
          data-tour-id="article.linked-topics"
        >
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <h2 id="article-forum-discussions" className="text-2xl font-bold">
              Sujets associés
            </h2>
            <Link
              href={`/forum/article/${article.slug}`}
              className="text-sm font-medium text-accent-dark hover:text-accent"
            >
              Tout voir
            </Link>
          </div>
          <ForumTopicList topics={forumTopics} showCategory />
        </section>
      ) : null}

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
