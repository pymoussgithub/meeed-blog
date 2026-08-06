"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Author = {
  id: string;
  name: string;
};

type ArticleFiltersModalProps = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  authors: Author[];
  basePath?: string;
};

type FilterDraft = {
  q: string;
  type: string;
  category: string;
  author: string;
  from: string;
  to: string;
};

const emptyDraft: FilterDraft = {
  q: "",
  type: "",
  category: "",
  author: "",
  from: "",
  to: "",
};

function draftFromParams(params: URLSearchParams): FilterDraft {
  return {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    author: params.get("author") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };
}

const selectClassName =
  "w-full rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm text-primary placeholder:text-primary/40 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function countDraftCriteria(draft: FilterDraft): number {
  let count = 0;
  if (draft.q.trim()) count += 1;
  if (draft.type) count += 1;
  if (draft.category) count += 1;
  if (draft.author) count += 1;
  if (draft.from) count += 1;
  if (draft.to) count += 1;
  return count;
}

export function ArticleFiltersModal({
  open,
  onClose,
  categories,
  authors,
  basePath = "/actualites",
}: ArticleFiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<FilterDraft>(emptyDraft);
  const appliedCount = countDraftCriteria(draftFromParams(searchParams));
  const draftCount = countDraftCriteria(draft);

  useEffect(() => {
    if (open) {
      setDraft(draftFromParams(searchParams));
    }
  }, [open, searchParams]);

  function updateDraft<K extends keyof FilterDraft>(key: K, value: FilterDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyFilters() {
    const params = new URLSearchParams();

    if (draft.q.trim()) params.set("q", draft.q.trim());
    if (draft.type) params.set("type", draft.type);
    if (draft.category) params.set("category", draft.category);
    if (draft.author) params.set("author", draft.author);
    if (draft.from) params.set("from", draft.from);
    if (draft.to) params.set("to", draft.to);

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
    onClose();
  }

  function resetFilters() {
    setDraft(emptyDraft);
    router.push(basePath, { scroll: false });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[min(90dvh,42rem)] max-w-lg overflow-hidden rounded-2xl p-0"
    >
      <form
        className="flex max-h-[min(90dvh,42rem)] flex-col"
        data-tour-id="articles.filters.panel"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
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
                draftCount > 0 ? "bg-accent/15 text-accent-dark" : "bg-primary/5 text-primary/50",
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
              onClick={resetFilters}
              disabled={draftCount === 0 && appliedCount === 0}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary/60 transition-colors hover:bg-bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Recherche</span>
            <input
              type="search"
              value={draft.q}
              onChange={(event) => updateDraft("q", event.target.value)}
              placeholder="Mot-clé dans les articles…"
              className={selectClassName}
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-primary-dark">Type de contenu</legend>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "", label: "Tous" },
                { value: "news", label: "Actualités" },
                { value: "formation", label: "Formations" },
              ].map((option) => (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => updateDraft("type", option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    draft.type === option.value
                      ? "border-accent bg-accent text-white"
                      : "border-gray-200 bg-white text-primary/70 hover:border-accent/40",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-dark">
                Domaine
              </span>
              <select
                value={draft.category}
                onChange={(event) => updateDraft("category", event.target.value)}
                className={selectClassName}
              >
                <option value="">Tous les domaines</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Auteur</span>
            <select
              value={draft.author}
              onChange={(event) => updateDraft("author", event.target.value)}
              className={selectClassName}
            >
              <option value="">Tous les auteurs</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
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
                className={selectClassName}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Au</span>
              <input
                type="date"
                value={draft.to}
                onChange={(event) => updateDraft("to", event.target.value)}
                className={selectClassName}
              />
            </label>
          </div>
        </div>

        <div className="shrink-0 border-t border-primary/10 px-5 py-4 sm:px-6">
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Fermer
            </Button>
            <Button type="submit" variant="accent" className="rounded-lg">
              Rechercher
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
