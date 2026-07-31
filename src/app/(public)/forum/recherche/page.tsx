import type { Metadata } from "next";
import { ForumSearchResults } from "@/components/forum/ForumSearchResults";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { FORUM_PAGE_SIZE, parseForumPage } from "@/lib/forum-listing";
import {
  forumSearchFiltersToQuery,
  hasForumSearchCriteria,
  normalizeForumSearchFilters,
} from "@/lib/forum-search";
import { searchForum } from "@/lib/services/forum-search.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    title?: string;
    author?: string;
    rubrique?: string;
    project?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = normalizeForumSearchFilters(params);
  const label = filters.title || filters.q;

  return buildPageMetadata({
    title: label ? `Recherche « ${label} » — Forum` : "Recherche — Forum",
    description: "Recherche avancée dans les sujets et messages du forum MEEED.",
    path: "/forum/recherche",
  });
}

export default async function ForumSearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = normalizeForumSearchFilters(params);
  const currentPage = parseForumPage(params.page);
  const offset = (currentPage - 1) * FORUM_PAGE_SIZE;
  const active = hasForumSearchCriteria(filters);
  const qTooShort = Boolean(filters.q && filters.q.length < 2);

  const { hits, total } =
    active && !qTooShort
      ? await searchForum(filters, { limit: FORUM_PAGE_SIZE, offset })
      : { hits: [], total: 0 };

  const totalPages = Math.max(1, Math.ceil(total / FORUM_PAGE_SIZE));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
    { name: "Recherche", path: "/forum/recherche" },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />
      <ForumToolbar backHref="/forum" searchFilters={filters} />

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-xl">Recherche</h1>
          {active && !qTooShort ? (
            <p className="mt-0.5 text-xs text-primary/55">
              {total} résultat{total > 1 ? "s" : ""}
            </p>
          ) : null}
        </div>
      </div>

      {!active ? (
        <p className="text-sm text-primary/60">
          Utilisez « Recherche avancée » pour filtrer par mot-clé (titres et réponses),
          titre, contributeur, rubrique, projet ou date.
        </p>
      ) : null}

      {qTooShort ? (
        <p className="text-sm text-primary/60">
          Saisissez au moins 2 caractères dans le champ contenu.
        </p>
      ) : null}

      {active && !qTooShort ? (
        <>
          <ForumSearchResults hits={hits} titleQuery={filters.title} />
          {hits.length > 0 ? (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath="/forum/recherche"
              query={forumSearchFiltersToQuery(filters)}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
