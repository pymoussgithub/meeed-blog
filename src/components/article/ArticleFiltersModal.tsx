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

type Project = {
  id: string;
  title: string;
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
  projects: Project[];
  authors: Author[];
  basePath?: string;
};

type FilterDraft = {
  type: string;
  category: string;
  project: string;
  author: string;
  from: string;
  to: string;
};

const emptyDraft: FilterDraft = {
  type: "",
  category: "",
  project: "",
  author: "",
  from: "",
  to: "",
};

function draftFromParams(params: URLSearchParams): FilterDraft {
  return {
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    project: params.get("project") ?? "",
    author: params.get("author") ?? "",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };
}

const selectClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function ArticleFiltersModal({
  open,
  onClose,
  categories,
  projects,
  authors,
  basePath = "/actualites",
}: ArticleFiltersModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState<FilterDraft>(emptyDraft);

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

    if (draft.type) params.set("type", draft.type);
    if (draft.category) params.set("category", draft.category);
    if (draft.project) params.set("project", draft.project);
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
    <Modal open={open} onClose={onClose} title="Filtrer les articles" className="max-w-lg">
      <div className="space-y-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-primary-dark">Type de contenu</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "Tous" },
              { value: "news", label: "Actualités" },
              { value: "project", label: "Projets" },
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
            <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Catégorie</span>
            <select
              value={draft.category}
              onChange={(event) => updateDraft("category", event.target.value)}
              className={selectClassName}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-primary-dark">Projet</span>
            <select
              value={draft.project}
              onChange={(event) => updateDraft("project", event.target.value)}
              className={selectClassName}
            >
              <option value="">Tous les projets</option>
              {projects.map((project) => (
                <option key={project.id} value={project.slug}>
                  {project.title}
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

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="ghost" onClick={resetFilters} className="rounded-lg">
            Réinitialiser
          </Button>
          <Button type="button" variant="accent" onClick={applyFilters} className="rounded-lg">
            Appliquer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
