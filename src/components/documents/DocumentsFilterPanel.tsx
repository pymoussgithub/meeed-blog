"use client";

import Link from "next/link";
import { Input } from "@/components/ui/Input";
import {
  buildDocumentsUrl,
  type DocumentsListingParams,
} from "@/lib/documents-listing";
import { cn } from "@/lib/utils";

type FilterOption = { id: string; label: string; slug?: string };

type DocumentsFilterPanelProps = {
  params: DocumentsListingParams;
  projects: FilterOption[];
  categories: FilterOption[];
  uploaders: FilterOption[];
};

const LINKED_OPTIONS = [
  { value: null, label: "Tous" },
  { value: "article" as const, label: "Liés à un article" },
  { value: "project" as const, label: "Liés à un projet" },
  { value: "no" as const, label: "Autonomes" },
];

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-accent text-white"
          : "border-gray-200 bg-white text-primary/70 hover:border-accent/40 hover:bg-bg-soft/50",
      )}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </Link>
  );
}

function FilterGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary/50">{label}</p>
      {children}
    </div>
  );
}

function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary/50">
        {label}
      </label>
      {children}
    </div>
  );
}
function ActiveFilterTag({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-gray-200 transition-colors hover:ring-accent/40"
    >
      {label}
      <span aria-hidden className="text-primary/40">
        ×
      </span>
    </Link>
  );
}

export function DocumentsFilterPanel({
  params,
  projects,
  categories,
  uploaders,
}: DocumentsFilterPanelProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5">
      <form action="/documents" method="GET" className="flex flex-col gap-3 sm:flex-row">
        {params.projectSlug ? (
          <input type="hidden" name="project" value={params.projectSlug} />
        ) : null}
        {params.categorySlug ? (
          <input type="hidden" name="category" value={params.categorySlug} />
        ) : null}
        {params.linked ? <input type="hidden" name="linked" value={params.linked} /> : null}
        {params.uploaderId ? <input type="hidden" name="user" value={params.uploaderId} /> : null}
        {params.dateFrom ? <input type="hidden" name="from" value={params.dateFrom} /> : null}
        {params.dateTo ? <input type="hidden" name="to" value={params.dateTo} /> : null}

        <div className="relative flex-1">
          <label htmlFor="documents-search" className="sr-only">
            Rechercher un document
          </label>
          <Input
            id="documents-search"
            name="q"
            type="search"
            defaultValue={params.q ?? ""}
            placeholder="Rechercher par titre ou description…"
            className="h-11 pr-4"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark sm:min-w-32"
        >
          Rechercher
        </button>
      </form>

      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_9.5rem_9.5rem_auto] lg:items-end">
        <FilterGroup label="Liaison" className="sm:col-span-2 lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap gap-1.5">
            {LINKED_OPTIONS.map((option) => (
              <FilterChip
                key={option.label}
                href={buildDocumentsUrl(params, { linked: option.value })}
                active={params.linked === option.value}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </FilterGroup>

        {(projects.length > 0 || categories.length > 0) && (
          <div className="space-y-3 sm:col-span-2 lg:col-start-1 lg:row-start-2">
            {projects.length > 0 ? (
              <FilterGroup label="Projet">
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    href={buildDocumentsUrl(params, { projectSlug: null })}
                    active={!params.projectSlug}
                  >
                    Tous les projets
                  </FilterChip>
                  {projects.map((project) => (
                    <FilterChip
                      key={project.id}
                      href={buildDocumentsUrl(params, {
                        projectSlug: project.slug ?? null,
                      })}
                      active={params.projectSlug === project.slug}
                    >
                      {project.label}
                    </FilterChip>
                  ))}
                </div>
              </FilterGroup>
            ) : null}

            {categories.length > 0 ? (
              <FilterGroup label="Catégorie">
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    href={buildDocumentsUrl(params, { categorySlug: null })}
                    active={!params.categorySlug}
                  >
                    Toutes les catégories
                  </FilterChip>
                  {categories.map((category) => (
                    <FilterChip
                      key={category.id}
                      href={buildDocumentsUrl(params, {
                        categorySlug: category.slug ?? null,
                      })}
                      active={params.categorySlug === category.slug}
                    >
                      {category.label}
                    </FilterChip>
                  ))}
                </div>
              </FilterGroup>
            ) : null}
          </div>
        )}

        <form action="/documents" method="GET" className="contents">
          {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
          {params.projectSlug ? (
            <input type="hidden" name="project" value={params.projectSlug} />
          ) : null}
          {params.categorySlug ? (
            <input type="hidden" name="category" value={params.categorySlug} />
          ) : null}
          {params.linked ? <input type="hidden" name="linked" value={params.linked} /> : null}

          <FilterField
            label="Contributeur"
            htmlFor="filter-user"
            className="sm:col-span-2 lg:col-start-2 lg:row-start-1"
          >
            <select
              id="filter-user"
              name="user"
              defaultValue={params.uploaderId ?? ""}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Tous</option>
              {uploaders.map((uploader) => (
                <option key={uploader.id} value={uploader.id}>
                  {uploader.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Du" htmlFor="filter-from" className="lg:col-start-2 lg:row-start-2">
            <Input
              id="filter-from"
              name="from"
              type="date"
              defaultValue={params.dateFrom ?? ""}
              className="h-10"
            />
          </FilterField>

          <FilterField label="Au" htmlFor="filter-to" className="lg:col-start-3 lg:row-start-2">
            <Input
              id="filter-to"
              name="to"
              type="date"
              defaultValue={params.dateTo ?? ""}
              className="h-10"
            />
          </FilterField>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-dark sm:col-span-2 lg:col-start-4 lg:row-start-2"
          >
            Appliquer
          </button>
        </form>
      </div>

      {params.q ||
      params.linked ||
      params.projectSlug ||
      params.categorySlug ||
      params.uploaderId ||
      params.dateFrom ||
      params.dateTo ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
          <span className="text-xs font-medium text-primary/50">Filtres actifs :</span>
          {params.q ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { q: null })}
              label={`« ${params.q} »`}
            />
          ) : null}
          {params.linked === "article" ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { linked: null })}
              label="Liés à un article"
            />
          ) : null}
          {params.linked === "project" ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { linked: null })}
              label="Liés à un projet"
            />
          ) : null}
          {params.linked === "no" ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { linked: null })}
              label="Autonomes"
            />
          ) : null}
          {params.projectSlug ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { projectSlug: null })}
              label={
                projects.find((project) => project.slug === params.projectSlug)?.label ??
                params.projectSlug
              }
            />
          ) : null}
          {params.categorySlug ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { categorySlug: null })}
              label={
                categories.find((category) => category.slug === params.categorySlug)?.label ??
                params.categorySlug
              }
            />
          ) : null}
          {params.uploaderId ? (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { uploaderId: null })}
              label={
                uploaders.find((uploader) => uploader.id === params.uploaderId)?.label ??
                "Contributeur"
              }
            />
          ) : null}
          {(params.dateFrom || params.dateTo) && (
            <ActiveFilterTag
              href={buildDocumentsUrl(params, { dateFrom: null, dateTo: null })}
              label={[params.dateFrom, params.dateTo].filter(Boolean).join(" → ")}
            />
          )}
          <Link
            href="/documents"
            className="ml-auto text-xs font-medium text-primary/60 underline-offset-2 hover:text-accent-dark hover:underline"
          >
            Tout effacer
          </Link>
        </div>
      ) : null}
    </div>
  );
}
