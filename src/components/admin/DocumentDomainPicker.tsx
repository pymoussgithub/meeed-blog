"use client";

import { useMemo, useState } from "react";
import type { DocumentAssociableCategory } from "@/components/admin/DocumentArticlePicker";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

type DocumentDomainPickerProps = {
  categories: DocumentAssociableCategory[];
  value: string;
  onChange: (categoryId: string) => void;
};

export function DocumentDomainPicker({
  categories,
  value,
  onChange,
}: DocumentDomainPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftId, setDraftId] = useState(value);

  const selected = useMemo(
    () => categories.find((category) => category.id === value) ?? null,
    [categories, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(q));
  }, [categories, query]);

  const openModal = () => {
    setDraftId(value);
    setQuery("");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setQuery("");
  };

  const confirmSelection = () => {
    onChange(draftId);
    closeModal();
  };

  return (
    <>
      <div className="space-y-2">
        <span className="mb-1 block text-sm font-medium text-primary-dark">Domaine</span>
        {selected ? (
          <div className="rounded-lg border border-primary/10 bg-bg-soft/40 px-3 py-2.5">
            <p className="text-sm font-semibold text-primary-dark">{selected.name}</p>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-primary/15 bg-white px-3 py-2.5 text-sm text-primary/45">
            Aucun domaine associé
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={openModal}
            disabled={categories.length === 0}
          >
            {selected ? "Modifier le domaine" : "Sélectionner un domaine"}
          </Button>
          {selected ? (
            <Button type="button" variant="ghost" onClick={() => onChange("")}>
              Retirer
            </Button>
          ) : null}
        </div>
        {categories.length === 0 ? (
          <p className="text-xs text-primary/45">Aucun domaine disponible.</p>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={closeModal}
        className="flex max-h-[min(90dvh,36rem)] max-w-lg flex-col overflow-hidden rounded-2xl p-0"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 border-b border-primary/10 px-5 pb-3 pt-5 sm:px-6">
            <h2 id="modal-title" className="text-lg font-bold text-primary-dark">
              Sélectionner un domaine
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
                domaine sélectionné
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
            <label htmlFor="document-associate-domain-search" className="sr-only">
              Rechercher un domaine
            </label>
            <input
              id="document-associate-domain-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un domaine…"
              className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-primary/55">
                Aucun domaine ne correspond.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-2">
                {filtered.map((category) => {
                  const isSelected = draftId === category.id;

                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftId((current) =>
                            current === category.id ? "" : category.id,
                          )
                        }
                        aria-pressed={isSelected}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition-all hover:border-accent/40 hover:shadow-md",
                          isSelected
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-primary/10",
                        )}
                      >
                        <span className="font-heading text-sm font-semibold text-primary-dark">
                          {category.name}
                        </span>
                        <span className="text-xs font-semibold text-accent-dark">
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
