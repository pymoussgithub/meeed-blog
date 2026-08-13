import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticlesToolbar } from "@/components/article/ArticlesToolbar";
import {
  ArticlesSections,
  type ArticlesCategorySection,
} from "@/components/articles/ArticlesSections";
import {
  hasActiveListingFilters,
  listingParamsToPaginationQuery,
  listingParamsToPublicFilters,
  parseArticlesListingParams,
} from "@/lib/articles-listing";
import { toCarouselArticle } from "@/lib/article-carousel";
import {
  getCachedActualitesListing,
  getCachedAllCategories,
  getCachedPublishedArticleAuthors,
} from "@/lib/public-cache";
import { buildPageMetadata } from "@/lib/seo";

/** Doit être un littéral (Next parse l’export `revalidate` statiquement). */
export const revalidate = 60;

type PageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    author?: string;
    from?: string;
    to?: string;
    type?: string;
  }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Nos articles",
  description:
    "Actualités de l'association MEEED et articles liés à nos domaines de transition agricole.",
  path: "/actualites",
});

export default async function ActualitesPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = parseArticlesListingParams(rawParams);
  const filters = listingParamsToPublicFilters(params);
  const isFiltered = hasActiveListingFilters(params);

  let sections: ArticlesCategorySection[] = [];
  let categories: Awaited<ReturnType<typeof getCachedAllCategories>> = [];
  let authors: Awaited<ReturnType<typeof getCachedPublishedArticleAuthors>> = [];
  let total = 0;
  let dbError = false;

  try {
    const [categoryList, authorList, listing] = await Promise.all([
      getCachedAllCategories(),
      getCachedPublishedArticleAuthors(),
      getCachedActualitesListing(filters),
    ]);

    categories = categoryList;
    authors = authorList;
    total = listing.total;
    const articleList = listing.articles;

    const filteredCategories = params.categorySlug
      ? categoryList.filter((category) => category.slug === params.categorySlug)
      : categoryList;

    sections = filteredCategories
      .map((category) => {
        const categoryArticles = articleList.filter((article) => {
          return article.categories.some(({ category: linked }) => linked.id === category.id);
        });

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          color: category.color,
          count: categoryArticles.length,
          articles: categoryArticles.map((article) =>
            toCarouselArticle(article, category.name),
          ),
        };
      })
      .filter((section) => section.count > 0)
      .sort((a, b) => {
        const aIsNews = a.slug === "actualites";
        const bIsNews = b.slug === "actualites";
        if (aIsNews && !bIsNews) return -1;
        if (!aIsNews && bIsNews) return 1;
        return 0;
      });
  } catch {
    dbError = true;
  }

  const returnQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(listingParamsToPaginationQuery(params))) {
    if (value) returnQuery.set(key, value);
  }
  const returnTo = returnQuery.toString()
    ? `/actualites?${returnQuery.toString()}`
    : "/actualites";

  return (
    <div className="container-meeed py-4 sm:py-5">
      <h1 className="sr-only">Articles</h1>

      {dbError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          Base de données non connectée. Lancez PostgreSQL puis{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:migrate</code>.
        </p>
      ) : (
        <>
          <Suspense fallback={<div className="mb-8 h-14 animate-pulse rounded-xl bg-gray-100" />}>
            <ArticlesToolbar
              categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))}
              authors={authors.map(({ id, name }) => ({ id, name }))}
              total={total}
            />
          </Suspense>

          <div className="mt-6">
            {total === 0 || sections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
                <p className="text-lg font-medium text-primary/80">
                  {isFiltered
                    ? "Aucun article ne correspond à vos filtres."
                    : "Aucun article publié pour le moment."}
                </p>
                {isFiltered ? (
                  <Link
                    href="/actualites"
                    className="mt-4 inline-block text-sm font-semibold text-accent-dark hover:underline"
                  >
                    Voir tous les articles
                  </Link>
                ) : null}
              </div>
            ) : (
              <ArticlesSections sections={sections} returnTo={returnTo} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
