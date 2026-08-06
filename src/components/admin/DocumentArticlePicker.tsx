"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDate } from "@/lib/utils";

export type DocumentAssociableArticle = {
  id: string;
  title: string;
  excerpt: string | null;
  status: string;
  authorName: string;
  categoryIds: string[];
  categoryNames: string[];
  publishedAt: string | null;
};

export type DocumentAssociableCategory = {
  id: string;
  name: string;
};

type DocumentArticlePickerProps = {
  articles: DocumentAssociableArticle[];
  categories: DocumentAssociableCategory[];
  value: string;
  onChange: (articleId: string) => void;
};

function statusLabel(status: string) {
  if (status === "DRAFT") return "Brouillon";
  if (status === "ARCHIVED") return "Archivé";
  return "Publié";
}

export function DocumentArticlePicker({
  articles,
  categories,
  value,
  onChange,
}: DocumentArticlePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [domainId, setDomainId] = useState("");
  const [draftId, setDraftId] = useState(value);

  const selected = useMemo(
    () => articles.find((article) => article.id === value) ?? null,
    [articles, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (domainId && !article.categoryIds.includes(domainId)) {
        return false;
      }
      if (!q) return true;
      return (
        article.title.toLowerCase().includes(q) ||
        (article.excerpt?.toLowerCase().includes(q) ?? false) ||
        article.authorName.toLowerCase().includes(q) ||
        article.categoryNames.some((name) => name.toLowerCase().includes(q))
      );
    });
  }, [articles, domainId, query]);

  const openModal = () => {
    setDraftId(value);
    setQuery("");
    setDomainId("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setQuery("");
    setDomainId("");
  };

  const confirmSelection = () => {
    onChange(draftId);
    closeModal();
  };

  return (
    <>
      <div className="space-y-2">
        <span className="mb-1 block text-sm font-medium text-primary-dark">Article</span>
        {selected ? (
          <div className="rounded-lg border border-primary/10 bg-bg-soft/40 px-3 py-2.5">
            <p className="text-sm font-semibold text-primary-dark">{selected.title}</p>
            {selected.categoryNames.length > 0 ? (
              <p className="mt-0.5 text-xs text-primary/55">
                {selected.categoryNames.join(" · ")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-primary/15 bg-white px-3 py-2.5 text-sm text-primary/45">
            Aucun article associé
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openModal}
            disabled={articles.length === 0}
          >
            {selected ? "Modifier l’article" : "Parcourir les articles"}
          </Button>
          {selected ? (
            <Button type="button" variant="ghost" onClick={() => onChange("")}>
              Retirer
            </Button>
          ) : null}
        </div>
        {articles.length === 0 ? (
          <p className="text-xs text-primary/45">Aucun article disponible.</p>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        className="flex max-h-[min(90dvh,42rem)] max-w-3xl flex-col overflow-hidden rounded-2xl p-0"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 border-b border-primary/10 px-5 pb-3 pt-5 sm:px-6">
            <h2 id="modal-title" className="text-lg font-bold text-primary-dark">
              Associer un article
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
                  draftId
                    ? "bg-accent/15 text-accent-dark"
                    : "bg-primary/5 text-primary/50",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                    draftId
                      ? "bg-accent text-white"
                      : "bg-primary/10 text-primary/45",
                  )}
                >
                  {draftId ? 1 : 0}
                </span>
                article sélectionné
              </span>
              <button
                type="button"
                onClick={() => setDraftId("")}
                disabled={!draftId}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary/60 transition-colors hover:bg-bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                Tout retirer
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="document-associate-article-search" className="sr-only">
                Rechercher un article
              </label>
              <input
                id="document-associate-article-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher par titre, domaine ou auteur…"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              />
              <label htmlFor="document-associate-article-domain" className="sr-only">
                Filtrer par domaine
              </label>
              <select
                id="document-associate-article-domain"
                value={domainId}
                onChange={(event) => setDomainId(event.target.value)}
                className={cn(
                  "h-10 w-full shrink-0 rounded-lg border bg-white px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 sm:w-44",
                  domainId
                    ? "border-accent font-semibold text-accent-dark"
                    : "border-gray-200 text-primary",
                )}
              >
                <option value="">Tous les domaines</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-primary/55">
                Aucun article ne correspond.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((article) => {
                  const isSelected = draftId === article.id;

                  return (
                    <li key={article.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftId((current) =>
                            current === article.id ? "" : article.id,
                          )
                        }
                        aria-pressed={isSelected}
                        className={cn(
                          "group flex h-full w-full flex-col justify-center gap-1 rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md",
                          isSelected
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-primary/10",
                        )}
                      >
                        <p className="text-[11px] text-primary/45">
                          {article.categoryNames.length > 0
                            ? article.categoryNames.join(" · ")
                            : "Sans domaine"}
                          {article.publishedAt
                            ? ` · ${formatDate(article.publishedAt)}`
                            : ""}
                        </p>
                        <p className="font-heading text-sm font-semibold text-primary-dark">
                          {article.title}
                        </p>
                        <p className="text-xs text-primary/55">
                          {article.authorName} · {statusLabel(article.status)}
                        </p>
                        <span className="mt-1 text-xs font-semibold text-accent-dark">
                          {isSelected ? "Sélectionné" : "Sélectionner"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="shrink-0 border-t border-primary/10 px-5 py-4 sm:px-6">
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Fermer
              </Button>
              <Button
                type="button"
                variant="accent"
                className="rounded-lg"
                onClick={confirmSelection}
              >
                Valider
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
