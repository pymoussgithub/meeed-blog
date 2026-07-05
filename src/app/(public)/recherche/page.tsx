import type { Metadata } from "next";
import { ArticleCard } from "@/components/article/ArticleCard";
import { SearchForm } from "@/components/layout/SearchForm";
import { Pagination } from "@/components/ui/Pagination";
import { countSearchResults, searchArticles } from "@/lib/services/article.service";
import { buildPageMetadata } from "@/lib/seo";

const PAGE_SIZE = 9;

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Recherche",
  description: "Rechercher dans les articles MEEED.",
  path: "/recherche",
});

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const currentPage = Math.max(1, Number(params.page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;

  let results: Awaited<ReturnType<typeof searchArticles>> = [];
  let total = 0;

  if (query) {
    try {
      [results, total] = await Promise.all([
        searchArticles(query, PAGE_SIZE, offset),
        countSearchResults(query),
      ]);
    } catch {
      // DB indisponible
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="container-meeed py-12">
      <h1 className="text-3xl font-bold sm:text-4xl">Recherche</h1>

      <div className="mt-8 max-w-xl">
        <SearchForm defaultValue={query} />
      </div>

      {query ? (
        <p className="mt-6 text-primary/70">
          {total} résultat{total > 1 ? "s" : ""} pour « <strong>{query}</strong> »
        </p>
      ) : (
        <p className="mt-6 text-primary/70">Saisissez un mot-clé pour rechercher dans les articles.</p>
      )}

      {results.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : null}

      {query && results.length === 0 ? (
        <p className="mt-10 text-primary/60">Aucun article trouvé.</p>
      ) : null}

      {query ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/recherche"
          query={{ q: query }}
        />
      ) : null}
    </div>
  );
}
