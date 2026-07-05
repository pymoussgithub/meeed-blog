"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleFiltersModal } from "@/components/article/ArticleFiltersModal";
import { SearchForm } from "@/components/layout/SearchForm";
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
};

function countActiveFilters(params: URLSearchParams) {
  let count = 0;
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

export function ArticlesToolbar({ categories, projects, authors }: ArticlesToolbarProps) {
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCount = countActiveFilters(searchParams);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <SearchForm className="w-full min-w-0 flex-1 sm:max-w-xs" />

        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
            activeCount > 0
              ? "border-accent bg-accent/10 text-accent-dark"
              : "border-gray-300 bg-white text-primary/70 hover:border-accent/40 hover:text-primary",
          )}
        >
          <FilterIcon className="h-4 w-4" />
          Filtres
          {activeCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
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
