"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDate } from "@/lib/utils";

export type AssociableForumTopic = {
  id: string;
  title: string;
  slug: string;
  status: string;
  lastPostAt: string | null;
  categoryName: string;
  authorName: string;
};

type AssociateForumTopicPickerProps = {
  topics: AssociableForumTopic[];
  selectedIds: string[];
  onConfirm: (ids: string[]) => void | Promise<void>;
  disabled?: boolean;
  triggerClassName?: string;
};

export function AssociateForumTopicPicker({
  topics,
  selectedIds,
  onConfirm,
  disabled = false,
  triggerClassName,
}: AssociateForumTopicPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(q) ||
        topic.categoryName.toLowerCase().includes(q) ||
        topic.authorName.toLowerCase().includes(q),
    );
  }, [topics, query]);

  const openModal = () => {
    setDraftIds(selectedIds);
    setQuery("");
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setQuery("");
  };

  const toggleDraft = (topicId: string) => {
    setDraftIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  };

  const confirmSelection = async () => {
    setSaving(true);
    try {
      await onConfirm(draftIds);
      setOpen(false);
      setQuery("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={triggerClassName}
        onClick={openModal}
        disabled={disabled || topics.length === 0}
      >
        Parcourir le forum
      </Button>

      <Modal
        open={open}
        onClose={closeModal}
        className="flex max-h-[min(90dvh,42rem)] max-w-3xl flex-col overflow-hidden rounded-2xl p-0"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 space-y-3 border-b border-primary/10 px-5 pb-3 pt-5 sm:px-6">
            <h2 id="modal-title" className="text-lg font-bold text-primary-dark">
              Associer des discussions
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
                sujet{draftIds.length > 1 ? "s" : ""} sélectionné
                {draftIds.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={() => setDraftIds([])}
                disabled={draftIds.length === 0 || saving}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary/60 transition-colors hover:bg-bg-soft hover:text-primary disabled:pointer-events-none disabled:opacity-40"
              >
                Tout retirer
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <label htmlFor="associate-forum-topic-search" className="sr-only">
              Rechercher un sujet
            </label>
            <input
              id="associate-forum-topic-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, rubrique ou auteur…"
              className="mb-4 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />

            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-primary/55">
                Aucun sujet ne correspond.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((topic) => {
                  const isSelected = draftIds.includes(topic.id);

                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        onClick={() => toggleDraft(topic.id)}
                        aria-pressed={isSelected}
                        disabled={saving}
                        className={cn(
                          "group flex h-full w-full flex-col justify-center gap-1 rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md disabled:pointer-events-none",
                          isSelected
                            ? "border-accent ring-2 ring-accent/30"
                            : "border-primary/10",
                        )}
                      >
                        <p className="text-[11px] text-primary/45">
                          {topic.categoryName}
                          {topic.lastPostAt
                            ? ` · ${formatDate(topic.lastPostAt)}`
                            : ""}
                        </p>
                        <p className="font-heading text-sm font-semibold text-primary-dark">
                          {topic.title}
                        </p>
                        <p className="text-xs text-primary/55">
                          {topic.authorName}
                          {topic.status === "LOCKED"
                            ? " · Verrouillé"
                            : topic.status === "ARCHIVED"
                              ? " · Archivé"
                              : ""}
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
              <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
                Fermer
              </Button>
              <Button
                type="button"
                variant="accent"
                className="rounded-lg"
                onClick={confirmSelection}
                disabled={saving}
              >
                {saving ? "Enregistrement…" : "Valider"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
