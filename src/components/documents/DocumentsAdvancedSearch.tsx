"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  buildDocumentsUrl,
  countDocumentFilters,
  type DocumentsListingParams,
} from "@/lib/documents-listing";
import { cn } from "@/lib/utils";

type FilterOption = { id: string; label: string; slug?: string };

type DocumentsAdvancedSearchProps = {
  params: DocumentsListingParams;
  categories: FilterOption[];
  uploaders: FilterOption[];
  className?: string;
};

type FilterDraft = {
  q: string;
  linked: "" | "article" | "no";
  category: string;
  user: string;
  from: string;
  to: string;
};

const emptyDraft: FilterDraft = {
  q: "",
  linked: "",
  category: "",
  user: "",
  from: "",
  to: "",
};

function draftFromParams(params: DocumentsListingParams): FilterDraft {
  return {
    q: params.q ?? "",
    linked: params.linked ?? "",
    category: params.categorySlug ?? "",
    user: params.uploaderId ?? "",
    from: params.dateFrom ?? "",
    to: params.dateTo ?? "",
  };
}

function draftToParams(draft: FilterDraft): DocumentsListingParams {
  return {
    q: draft.q.trim() || null,
    linked: draft.linked || null,
    categorySlug: draft.category || null,
    uploaderId: draft.user || null,
    dateFrom: draft.from || null,
    dateTo: draft.to || null,
  };
}

const fieldClassName =
  "w-full rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function SearchIcon({ className }: { className?: string }) {
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
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
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

export function DocumentsAdvancedSearch({
  params,
  categories,
  uploaders,
  className,
}: DocumentsAdvancedSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(() => draftFromParams(params));
  const appliedCount = countDocumentFilters(params);
  const draftCount = countDocumentFilters(draftToParams(draft));

  useEffect(() => {
    if (open) {
      setDraft(draftFromParams(params));
    }
  }, [open, params]);

  function updateDraft<K extends keyof FilterDraft>(key: K, value: FilterDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applySearch() {
    router.push(buildDocumentsUrl(draftToParams(draft)));
    setOpen(false);
  }

  function clearFilters() {
    setDraft(emptyDraft);
    if (appliedCount > 0) {
      router.push("/documents");
      setOpen(false);
    }
  }

  return (
    <>
      <div className={cn("inline-flex h-9 shrink-0 items-center gap-1.5", className)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-tour-id="documents.toolbar"
          className={cn(
            "inline-flex h-full items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold shadow-sm transition-all",
            appliedCount > 0
              ? "border-accent bg-accent/15 text-accent-dark shadow-accent/10 hover:bg-accent/25"
              : "border-primary/15 bg-white text-primary hover:border-accent/50 hover:bg-bg-soft/60 hover:text-accent-dark",
          )}
        >
          <SearchIcon className="h-3.5 w-3.5 shrink-0 text-accent-dark" />
          <span className="hidden sm:inline">Recherche avancée</span>
          <span className="sm:hidden">Recherche</span>
          {appliedCount > 0 ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
              {appliedCount}
            </span>
          ) : null}
        </button>

        {appliedCount > 0 ? (
          <button
            type="button"
            onClick={clearFilters}
            title="Supprimer les filtres"
            aria-label="Supprimer les filtres de recherche"
            className="inline-flex h-full w-9 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary/50 shadow-sm transition-all hover:border-primary/20 hover:bg-bg-soft hover:text-primary"
          >
            <ClearIcon className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="max-h-[min(90dvh,42rem)] max-w-lg overflow-hidden rounded-2xl p-0"
        data-tour-id="documents.filters.panel"
      >
        <form
          className="flex max-h-[min(90dvh,42rem)] flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
        >
          <div className="shrink-0 space-y-3 border-b border-primary/10 px-5 pb-3 pt-5 sm:px-6">
            <h2 id="modal-title" className="text-lg font-bold text-primary-dark">
              Recherche avancée
            </h2>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
                  draftCount > 0
                    ? "bg-accent/15 text-accent-dark"
                    : "bg-primary/5 text-primary/50",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                    draftCount > 0 ? "bg-accent text-white" : "bg-primary/10 text-primary/45",
                  )}
                >
                  {draftCount}
                </span>
                filtre{draftCount > 1 ? "s" : ""} actif{draftCount > 1 ? "s" : ""}
              </span>

              <button
                type="button"
                onClick={clearFilters}
                disabled={draftCount === 0 && appliedCount === 0}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary/60 transition-colors hover:bg-bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-dark">
                Titre ou description
              </span>
              <input
                type="search"
                value={draft.q}
                onChange={(event) => updateDraft("q", event.target.value)}
                placeholder="Rechercher un document…"
                className={fieldClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Liaison</span>
              <select
                value={draft.linked}
                onChange={(event) =>
                  updateDraft("linked", event.target.value as FilterDraft["linked"])
                }
                className={fieldClassName}
              >
                <option value="">Tous</option>
                <option value="article">Liés à un article</option>
                <option value="no">Autonomes</option>
              </select>
            </label>

            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary-dark">
                  Domaine
                </span>
                <select
                  value={draft.category}
                  onChange={(event) => updateDraft("category", event.target.value)}
                  className={fieldClassName}
                >
                  <option value="">Tous les domaines</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug ?? ""}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-dark">
                Contributeur
              </span>
              <select
                value={draft.user}
                onChange={(event) => updateDraft("user", event.target.value)}
                className={fieldClassName}
              >
                <option value="">Tous les contributeurs</option>
                {uploaders.map((uploader) => (
                  <option key={uploader.id} value={uploader.id}>
                    {uploader.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Du</span>
                <input
                  type="date"
                  value={draft.from}
                  onChange={(event) => updateDraft("from", event.target.value)}
                  className={fieldClassName}
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Au</span>
                <input
                  type="date"
                  value={draft.to}
                  onChange={(event) => updateDraft("to", event.target.value)}
                  className={fieldClassName}
                />
              </label>
            </div>
          </div>

          <div className="shrink-0 border-t border-primary/10 px-5 py-4 sm:px-6">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Fermer
              </Button>
              <Button type="submit" variant="accent" className="rounded-lg">
                Rechercher
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
