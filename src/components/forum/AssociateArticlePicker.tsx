"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDate } from "@/lib/utils";

export type AssociableArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
};

type AssociateArticlePickerProps = {
  articles: AssociableArticle[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function AssociateArticlePicker({
  articles,
  selectedIds,
  onChange,
}: AssociateArticlePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => articles.find((article) => article.id === id))
        .filter((article): article is AssociableArticle => Boolean(article)),
    [articles, selectedIds],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(q) ||
        (article.excerpt?.toLowerCase().includes(q) ?? false),
    );
  }, [articles, query]);

  const openModal = () => {
    setDraftIds(selectedIds);
    setQuery("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setQuery("");
  };

  const toggleDraft = (articleId: string) => {
    setDraftIds((current) =>
      current.includes(articleId)
        ? current.filter((id) => id !== articleId)
        : [...current, articleId],
    );
  };

  const confirmSelection = () => {
    onChange(draftIds);
    closeModal();
  };

  const removeSelected = (articleId: string) => {
    onChange(selectedIds.filter((id) => id !== articleId));
  };

  return (
    <>
      <aside className="rounded-xl border border-primary/10 bg-bg-soft/40 p-4 sm:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
          Articles du blog
        </h2>
        <p className="mt-1 text-sm text-primary/60">
          Liez éventuellement un ou plusieurs articles publiés comme référence de
          cette discussion.
        </p>

        {selected.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {selected.map((article) => (
              <li
                key={article.id}
                className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm"
              >
                <div className="relative aspect-[16/10] bg-bg-soft">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/25 to-bg-soft">
                      <span className="font-heading text-2xl font-bold text-accent-dark/60">
                        M
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="font-heading text-sm font-semibold text-primary-dark">
                    {article.title}
                  </p>
                  {article.excerpt ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-primary/55">
                      {article.excerpt}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => removeSelected(article.id)}
                    >
                      Retirer
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <div className={selected.length > 0 ? "mt-3" : "mt-4"}>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={openModal}
            disabled={articles.length === 0}
          >
            {selected.length > 0 ? "Ajouter / modifier" : "Associer des articles"}
          </Button>
          {articles.length === 0 ? (
            <p className="mt-2 text-xs text-primary/45">
              Aucun article publié disponible.
            </p>
          ) : null}
        </div>
      </aside>

      <Modal
        open={open}
        onClose={closeModal}
        className="flex max-h-[min(90dvh,42rem)] max-w-3xl flex-col overflow-hidden rounded-2xl p-0"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 border-b border-primary/10 px-5 pb-3 pt-5 sm:px-6">
            <h2 id="modal-title" className="text-lg font-bold text-primary-dark">
              Associer des articles
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
                  draftIds.length > 0
                    ? "bg-accent/15 text-accent-dark"
                    : "bg-primary/5 text-primary/50",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                    draftIds.length > 0
                      ? "bg-accent text-white"
                      : "bg-primary/10 text-primary/45",
                  )}
                >
                  {draftIds.length}
                </span>
                article{draftIds.length > 1 ? "s" : ""} sélectionné
                {draftIds.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => setDraftIds([])}
                disabled={draftIds.length === 0}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary/60 transition-colors hover:bg-bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                Tout retirer
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <label htmlFor="associate-article-search" className="sr-only">
              Rechercher un article
            </label>
            <input
              id="associate-article-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre…"
              className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-primary/55">
                Aucun article ne correspond.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((article) => {
                  const isSelected = draftIds.includes(article.id);

                  return (
                    <li key={article.id}>
                      <button
                        type="button"
                        onClick={() => toggleDraft(article.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          "group flex h-full w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md",
                          isSelected
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-primary/10",
                        )}
                      >
                        <div className="relative min-h-[5.5rem] w-24 shrink-0 self-stretch bg-bg-soft sm:w-28">
                          {article.coverImageUrl ? (
                            <Image
                              src={article.coverImageUrl}
                              alt=""
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="112px"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/30 to-bg-soft"
                              aria-hidden="true"
                            >
                              <span className="font-heading text-lg font-bold text-accent-dark/70">
                                M
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-3">
                          {article.publishedAt ? (
                            <time
                              dateTime={article.publishedAt}
                              className="text-[11px] text-primary/45"
                            >
                              {formatDate(article.publishedAt)}
                            </time>
                          ) : null}
                          <p className="font-heading text-sm font-semibold text-primary-dark">
                            {article.title}
                          </p>
                          {article.excerpt ? (
                            <p className="line-clamp-2 text-xs leading-relaxed text-primary/55">
                              {article.excerpt}
                            </p>
                          ) : null}
                          <span className="mt-1 text-xs font-semibold text-accent-dark">
                            {isSelected ? "Sélectionné" : "Sélectionner"}
                          </span>
                        </div>
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
