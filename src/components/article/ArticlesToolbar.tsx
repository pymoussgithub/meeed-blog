"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleFiltersModal } from "@/components/article/ArticleFiltersModal";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Project = {
  id: string;
  title: string;
  slug: string;
};

type Author = {
  id: string;
  name: string;
};

type ArticlesToolbarProps = {
  categories: Category[];
  projects: Project[];
  authors: Author[];
  total: number;
  newArticleHref?: string | null;
};

function countActiveFilters(params: URLSearchParams) {
  let count = 0;
  if (params.get("q")) count += 1;
  if (params.get("category")) count += 1;
  if (params.get("project")) count += 1;
  if (params.get("author")) count += 1;
  if (params.get("from")) count += 1;
  if (params.get("to")) count += 1;
  if (params.get("type")) count += 1;
  return count;
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M2.628 3.094A1.5 1.5 0 0 1 3.75 2.5h12.5a1.5 1.5 0 0 1 1.122 2.494l-4.25 4.75v4.256a1.5 1.5 0 0 1-2.244 1.306l-2.5-1.25A1.5 1.5 0 0 1 8 13.5V9.744L3.628 4.994A1.5 1.5 0 0 1 2.628 3.094Z" />
    </svg>
  );
}

export function ArticlesToolbar({
  categories,
  projects,
  authors,
  total,
  newArticleHref = null,
}: ArticlesToolbarProps) {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(searchParams);
  const clearHref = "/actualites";

  return (
    <>
      <div className="mb-4 border-b border-primary/10 pb-3">
        <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="justify-self-start md:col-start-1">
            <div className="inline-flex h-9 items-center rounded-lg border border-primary/15 bg-white px-3 text-sm font-semibold text-primary shadow-sm">
              {total} article{total > 1 ? "s" : ""}
            </div>
          </div>
          <div className="justify-self-start md:col-start-2 md:justify-self-center">
            <div className="inline-flex h-9 shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                data-tour-id="articles.filters.toggle"
                className={cn(
                  "inline-flex h-full items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold shadow-sm transition-all",
                  activeCount > 0
                    ? "border-accent bg-accent/15 text-accent-dark shadow-accent/10 hover:bg-accent/25"
                    : "border-primary/15 bg-white text-primary hover:border-accent/50 hover:bg-bg-soft/60 hover:text-accent-dark",
                )}
              >
                <FilterIcon className="h-3.5 w-3.5 shrink-0 text-accent-dark" />
                <span className="hidden sm:inline">Recherche avancée</span>
                <span className="sm:hidden">Recherche</span>
                {activeCount > 0 ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {activeCount}
                  </span>
                ) : null}
              </button>

              {activeCount > 0 ? (
                <Link
                  href={clearHref}
                  title="Supprimer les filtres"
                  aria-label="Supprimer les filtres de recherche"
                  className="inline-flex h-full w-9 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary/50 shadow-sm transition-all hover:border-primary/20 hover:bg-bg-soft hover:text-primary"
                >
                  <ClearIcon className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </div>

          <div className="col-start-2 justify-self-end md:col-start-3">
            {newArticleHref ? (
              <Link
                href={newArticleHref}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white shadow-sm shadow-accent/25 transition-all hover:bg-accent-dark hover:shadow-md hover:shadow-accent/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                <span className="hidden sm:inline">Nouvel article</span>
                <span className="sm:hidden">Nouveau</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <ArticleFiltersModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        categories={categories}
        projects={projects}
        authors={authors}
      />
    </>
  );
}
function ClearIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

