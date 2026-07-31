"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import {
  buildArticlesUrl,
  hasActiveListingFilters,
  type ArticlesListingParams,
} from "@/lib/articles-listing";
import { cn } from "@/lib/utils";

type FilterOption = { id: string; label: string; slug?: string };

type ArticlesFilterBarProps = {
  params: ArticlesListingParams;
  categories: FilterOption[];
  projects: FilterOption[];
  authors: FilterOption[];
  total: number;
};

const filterBtnBase =
  "inline-flex h-11 w-full min-w-0 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium shadow-sm transition-all hover:border-accent/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30";

export function ArticlesFilterBar({
  params,
  categories,
  projects,
  authors,
  total,
}: ArticlesFilterBarProps) {
  const router = useRouter();
  const [dateOpen, setDateOpen] = useState(Boolean(params.dateFrom || params.dateTo));
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);
  const hasFilters = hasActiveListingFilters(params);

  function navigate(overrides: Partial<ArticlesListingParams>) {
    router.push(buildArticlesUrl(params, { ...overrides, page: null }));
  }

  function applyDates() {
    navigate({
      dateFrom: dateFromRef.current?.value || null,
      dateTo: dateToRef.current?.value || null,
    });
    setDateOpen(false);
  }

  const activeProject = projects.find((p) => p.slug === params.projectSlug);
  const activeCategory = categories.find((c) => c.slug === params.categorySlug);
  const activeAuthor = authors.find((a) => a.id === params.authorId);
  const dateActive = Boolean(params.dateFrom || params.dateTo);

  return (
    <div className="space-y-4" data-tour-id="articles.filters.toggle">
      <div
        className="overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-b from-bg-soft/30 to-white shadow-sm"
        data-tour-id="articles.filters.panel"
      >
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-5">
          <form action="/actualites" method="GET" className="flex w-full gap-2">
            {params.projectSlug ? (
              <input type="hidden" name="project" value={params.projectSlug} />
            ) : null}
            {params.categorySlug ? (
              <input type="hidden" name="category" value={params.categorySlug} />
            ) : null}
            {params.authorId ? <input type="hidden" name="author" value={params.authorId} /> : null}
            {params.contentType ? (
              <input type="hidden" name="type" value={params.contentType} />
            ) : null}
            {params.dateFrom ? <input type="hidden" name="from" value={params.dateFrom} /> : null}
            {params.dateTo ? <input type="hidden" name="to" value={params.dateTo} /> : null}

            <div className="relative min-w-0 flex-1">
              <label htmlFor="articles-search" className="sr-only">
                Rechercher
              </label>
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/35" />
              <Input
                id="articles-search"
                name="q"
                type="search"
                defaultValue={params.q ?? ""}
                placeholder="Rechercher un article…"
                className="h-11 border-gray-200 bg-white pl-10 text-sm shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark sm:px-5"
            >
              Rechercher
            </button>
          </form>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <p className="sr-only">Filtrer par</p>
            <FilterSelect
              label="Thématique"
              value={params.projectSlug ?? ""}
              displayValue={activeProject?.label}
              placeholder="Thématique"
              options={[
                { value: "", label: "Toutes les thématiques" },
                ...projects.map((p) => ({ value: p.slug ?? "", label: p.label })),
              ]}
              onChange={(value) => navigate({ projectSlug: value || null })}
            />

            <FilterSelect
              label="Catégorie"
              value={params.categorySlug ?? ""}
              displayValue={activeCategory?.label}
              placeholder="Catégorie"
              options={[
                { value: "", label: "Toutes les catégories" },
                ...categories.map((c) => ({ value: c.slug ?? "", label: c.label })),
              ]}
              onChange={(value) => navigate({ categorySlug: value || null })}
            />

            <FilterSelect
              label="Auteur"
              value={params.authorId ?? ""}
              displayValue={activeAuthor?.label}
              placeholder="Auteur"
              options={[
                { value: "", label: "Tous les auteurs" },
                ...authors.map((a) => ({ value: a.id, label: a.label })),
              ]}
              onChange={(value) => navigate({ authorId: value || null })}
            />

            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setDateOpen((open) => !open)}
                className={cn(
                  filterBtnBase,
                  dateOpen && "border-accent ring-2 ring-accent/20",
                  dateActive
                    ? "border-accent bg-accent/10 text-accent-dark"
                    : "border-gray-200 text-primary/80",
                )}
                aria-expanded={dateOpen}
              >
                <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
                <span className="flex min-w-0 flex-1 flex-col items-start leading-none">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/45">
                    Période
                  </span>
                  <span className="mt-0.5 w-full truncate text-left text-sm">
                    {dateActive
                      ? [params.dateFrom, params.dateTo].filter(Boolean).join(" → ")
                      : "Toutes les dates"}
                  </span>
                </span>
                <ChevronIcon className="ml-1 h-4 w-4 shrink-0 opacity-40" />
              </button>

              {dateOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDateOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute left-0 right-0 z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl sm:left-auto sm:w-72">
                    <p className="mb-3 text-sm font-semibold text-primary">Filtrer par date</p>
                    <div className="space-y-3">
                      <Input
                        ref={dateFromRef}
                        type="date"
                        label="Publié après le"
                        defaultValue={params.dateFrom ?? ""}
                        className="text-sm"
                      />
                      <Input
                        ref={dateToRef}
                        type="date"
                        label="Publié avant le"
                        defaultValue={params.dateTo ?? ""}
                        className="text-sm"
                      />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={applyDates}
                        className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
                      >
                        Appliquer
                      </button>
                      {dateActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            navigate({ dateFrom: null, dateTo: null });
                            setDateOpen(false);
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:border-gray-300 hover:text-primary"
                        >
                          Effacer
                        </button>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold tabular-nums text-primary/60">
          {total} article{total !== 1 ? "s" : ""}
        </span>

        {hasFilters ? (
          <>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" aria-hidden />
            <div className="flex flex-wrap items-center gap-2">
              {params.q ? (
                <FilterChip
                  href={buildArticlesUrl(params, { q: null, page: null })}
                  label={`« ${params.q} »`}
                />
              ) : null}
              {activeProject ? (
                <FilterChip
                  href={buildArticlesUrl(params, { projectSlug: null, page: null })}
                  label={activeProject.label}
                />
              ) : null}
              {activeCategory ? (
                <FilterChip
                  href={buildArticlesUrl(params, { categorySlug: null, page: null })}
                  label={activeCategory.label}
                />
              ) : null}
              {activeAuthor ? (
                <FilterChip
                  href={buildArticlesUrl(params, { authorId: null, page: null })}
                  label={activeAuthor.label}
                />
              ) : null}
              {dateActive ? (
                <FilterChip
                  href={buildArticlesUrl(params, { dateFrom: null, dateTo: null, page: null })}
                  label={[params.dateFrom, params.dateTo].filter(Boolean).join(" → ")}
                />
              ) : null}
              <Link
                href="/actualites"
                className="inline-flex h-7 items-center rounded-full border border-gray-200 bg-white px-3 text-xs font-semibold text-primary/60 shadow-sm transition-colors hover:border-accent/40 hover:text-accent-dark"
              >
                Tout effacer
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  displayValue,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  displayValue?: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const active = Boolean(value);

  return (
    <div className="relative w-full min-w-0">
      <label htmlFor={`filter-${label}`} className="sr-only">
        {label}
      </label>
      <div
        className={cn(
          filterBtnBase,
          "relative cursor-pointer pr-9",
          active
            ? "border-accent bg-accent/10 text-accent-dark"
            : "border-gray-200 text-primary/80",
        )}
      >
        <FilterIcon className="h-4 w-4 shrink-0 opacity-60" />
        <span className="flex min-w-0 flex-1 flex-col items-start leading-none">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary/45">
            {label}
          </span>
          <span className="mt-0.5 w-full truncate text-left text-sm">
            {active ? displayValue : placeholder}
          </span>
        </span>
        <ChevronIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-40" />
        <select
          id={`filter-${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {options.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function FilterChip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-dark transition-colors hover:bg-accent/20"
    >
      {label}
      <span
        aria-hidden
        className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[10px] leading-none"
      >
        ×
      </span>
    </Link>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M9 3.5a5.5 5.5 0 1 0 3.47 9.82l3.08 3.08a.75.75 0 1 0 1.06-1.06l-3.08-3.08A5.5 5.5 0 0 0 9 3.5Zm0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 5.5A.75.75 0 0 1 3.75 4.75h12.5a.75.75 0 0 1 .53 1.28l-4.72 4.72v4.25a.75.75 0 0 1-1.13.65l-2.5-1.5A.75.75 0 0 1 8.5 14V10.75L3.97 6.03A.75.75 0 0 1 3 5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 2a.75.75 0 0 1 .75.75V4h6.5V2.75a.75.75 0 0 1 1.5 0V4h.75A2.25 2.25 0 0 1 17.75 6.25v9.5A2.25 2.25 0 0 1 15.5 18h-11A2.25 2.25 0 0 1 2.25 15.75v-9.5A2.25 2.25 0 0 1 4.5 4H5.25V2.75A.75.75 0 0 1 6 2Zm9.75 6.5h-11v7.25c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75V8.5ZM5.25 5.5h-.75a.75.75 0 0 0-.75.75V7h11.5V6.25a.75.75 0 0 0-.75-.75h-.75V6a.75.75 0 0 1-1.5 0V5.5h-6.5V6a.75.75 0 0 1-1.5 0V5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5.5 7.75 10 12.25l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
