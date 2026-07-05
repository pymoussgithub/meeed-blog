import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticlesFilterBar } from "@/components/articles/ArticlesFilterBar";
import { ArticlesSections } from "@/components/articles/ArticlesSections";
import { Pagination } from "@/components/ui/Pagination";
import {
  hasActiveListingFilters,
  listingParamsToPaginationQuery,
  listingParamsToPublicFilters,
  parseArticlesListingParams,
} from "@/lib/articles-listing";
import {
  countFilteredPublishedArticles,
  getFilteredPublishedArticles,
  getPublishedArticleAuthors,
} from "@/lib/services/article.service";
import { getPublishedCategories } from "@/lib/services/category.service";
import { getActiveProjects } from "@/lib/services/project.service";
import { buildPageMetadata } from "@/lib/seo";

const PAGE_SIZE = 24;

type PageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    project?: string;
    author?: string;
    from?: string;
    to?: string;
    type?: string;
  }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Nos articles",
  description:
    "Actualités de l'association MEEED et articles liés à nos projets de transition agricole.",
  path: "/actualites",
});

export default async function ActualitesPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = parseArticlesListingParams(rawParams);
  const filters = listingParamsToPublicFilters(params);
  const isFiltered = hasActiveListingFilters(params);
  const showSections = !isFiltered && params.page === 1;
  const newsFirst = !params.contentType;

  let articles: Awaited<ReturnType<typeof getFilteredPublishedArticles>> = [];
  let categories: Awaited<ReturnType<typeof getPublishedCategories>> = [];
  let projects: Awaited<ReturnType<typeof getActiveProjects>> = [];
  let authors: Awaited<ReturnType<typeof getPublishedArticleAuthors>> = [];
  let total = 0;
  let dbError = false;

  try {
    const offset = (params.page! - 1) * PAGE_SIZE;

    const [categoryList, projectList, authorList, articleCount, articleList] = await Promise.all([
      getPublishedCategories(),
      getActiveProjects(),
      getPublishedArticleAuthors(),
      countFilteredPublishedArticles(filters),
      getFilteredPublishedArticles(filters, PAGE_SIZE, offset, { newsFirst }),
    ]);

    articles = articleList;
    categories = categoryList;
    projects = projectList;
    authors = authorList;
    total = articleCount;
  } catch {
    dbError = true;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-meeed py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold sm:text-4xl">Nos articles</h1>
        <p className="mt-2 max-w-2xl text-primary/65">
          Toutes nos publications — actualités de l&apos;association en premier, puis articles
          par thématique.
        </p>
      </header>

      {dbError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          Base de données non connectée. Lancez PostgreSQL puis{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:migrate</code>.
        </p>
      ) : (
        <>
          <Suspense fallback={<div className="mb-8 h-14 animate-pulse rounded-xl bg-gray-100" />}>
            <ArticlesFilterBar
              params={params}
              categories={categories.map(({ id, name, slug }) => ({ id, label: name, slug }))}
              projects={projects.map(({ id, title, slug }) => ({
                id,
                label: title,
                slug,
              }))}
              authors={authors.map(({ id, name }) => ({ id, label: name }))}
              total={total}
            />
          </Suspense>

          <div className="mt-8">
            {total === 0 ? (
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
              <ArticlesSections articles={articles} showSections={showSections} />
            )}
          </div>

          <Pagination
            currentPage={params.page!}
            totalPages={totalPages}
            basePath="/actualites"
            query={listingParamsToPaginationQuery(params)}
          />
        </>
      )}
    </div>
  );
}
