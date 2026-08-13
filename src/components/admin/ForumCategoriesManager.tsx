"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createForumCategoryAction,
  deleteForumCategoryAction,
  reorderForumCategoriesAction,
  updateForumCategoryAction,
} from "@/actions/forum-moderation.actions";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

export type ForumCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { topics: number };
};

type ForumCategoriesManagerProps = {
  categories: ForumCategoryRow[];
  allCategories: ForumCategoryRow[];
  canReorder: boolean;
};

function buildRubriquesUrl(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const query = params.toString();
  return query ? `/admin/forum/rubriques?${query}` : "/admin/forum/rubriques";
}

export function ForumCategoriesManager({
  categories,
  allCategories,
  canReorder,
}: ForumCategoriesManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm, alert } = useDialog();
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [ordered, setOrdered] = useState(categories);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const showCreate = searchParams.get("new") === "1";
  const editingId = searchParams.get("edit");
  const editingCategory = allCategories.find((category) => category.id === editingId) ?? null;

  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createActive, setCreateActive] = useState(true);

  const [editName, setEditName] = useState(editingCategory?.name ?? "");
  const [editSlug, setEditSlug] = useState(editingCategory?.slug ?? "");
  const [editDescription, setEditDescription] = useState(editingCategory?.description ?? "");
  const [editActive, setEditActive] = useState(editingCategory?.isActive ?? true);

  useEffect(() => {
    setOrdered(categories);
  }, [categories]);

  useEffect(() => {
    if (!editingId) {
      setEditName("");
      setEditSlug("");
      setEditDescription("");
      setEditActive(true);
      return;
    }

    const category = allCategories.find((item) => item.id === editingId);
    if (!category) return;

    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? "");
    setEditActive(category.isActive);
    // Re-seed the form only when switching the edited rubrique.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [editingId]);

  const closePanels = () => {
    router.push(
      buildRubriquesUrl(searchParams, {
        new: null,
        edit: null,
      }),
    );
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await createForumCategoryAction({
      name: createName,
      slug: createSlug || slugify(createName),
      description: createDescription || null,
      sortOrder: allCategories.length,
      isActive: createActive,
    });
    setSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setCreateName("");
    setCreateSlug("");
    setCreateDescription("");
    setCreateActive(true);
    setToast({ message: "Rubrique créée.", variant: "success" });
    router.push(buildRubriquesUrl(searchParams, { new: null, edit: null }));
    router.refresh();
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCategory) return;

    setSaving(true);
    const result = await updateForumCategoryAction(editingCategory.id, {
      name: editName,
      slug: editSlug || slugify(editName),
      description: editDescription || null,
      isActive: editActive,
    });
    setSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Rubrique mise à jour.", variant: "success" });
    router.push(buildRubriquesUrl(searchParams, { new: null, edit: null }));
    router.refresh();
  };

  const toggleVisibility = async (category: ForumCategoryRow) => {
    const result = await updateForumCategoryAction(category.id, {
      isActive: !category.isActive,
    });
    if (!result.success) {
      await alert(result.error, { variant: "error" });
      return;
    }
    router.refresh();
  };

  const handleDelete = async (category: ForumCategoryRow) => {
    if (category._count.topics > 0) {
      await alert(
        `Impossible de supprimer « ${category.name} » : ${category._count.topics} sujet${category._count.topics > 1 ? "s" : ""} y ${category._count.topics > 1 ? "sont" : "est"} encore rattaché${category._count.topics > 1 ? "s" : ""}.`,
        { variant: "error", title: "Suppression impossible" },
      );
      return;
    }

    const ok = await confirm(
      `Supprimer définitivement la rubrique « ${category.name} » ? Cette action est irréversible.`,
      { title: "Supprimer la rubrique ?", variant: "danger", confirmLabel: "Supprimer" },
    );
    if (!ok) return;

    const result = await deleteForumCategoryAction(category.id);
    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Rubrique supprimée.", variant: "success" });
    if (editingId === category.id) {
      router.push(buildRubriquesUrl(searchParams, { edit: null, new: null }));
    }
    router.refresh();
  };

  const persistOrder = async (nextOrdered: ForumCategoryRow[]) => {
    const previous = ordered;
    setOrdered(nextOrdered);
    setReordering(true);

    const result = await reorderForumCategoriesAction({
      orderedIds: nextOrdered.map((category) => category.id),
    });

    setReordering(false);

    if (!result.success) {
      setOrdered(previous);
      setToast({ message: result.error, variant: "error" });
      return;
    }

    router.refresh();
  };

  const moveCategory = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    void persistOrder(next);
  };

  const tableActionClassName =
    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

  return (
    <div className="space-y-6">
      {showCreate ? (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-accent/30 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-primary-dark">Nouvelle rubrique</h2>
              <p className="mt-1 text-sm text-primary/60">
                Le slug sert d’URL publique : /forum/r/…
              </p>
            </div>
            <button
              type="button"
              onClick={closePanels}
              className="text-sm text-primary/60 hover:text-primary-dark hover:underline"
            >
              Annuler
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              label="Nom"
              value={createName}
              onChange={(e) => {
                const next = e.target.value;
                setCreateName(next);
                if (!createSlug || createSlug === slugify(createName)) {
                  setCreateSlug(slugify(next));
                }
              }}
              required
            />
            <Input
              label="Slug"
              value={createSlug}
              onChange={(e) => setCreateSlug(slugify(e.target.value))}
              placeholder={slugify(createName) || "ma-rubrique"}
              required
            />
            <label className="flex items-end gap-2 pb-2 text-sm text-primary-dark md:col-span-2">
              <input
                type="checkbox"
                checked={createActive}
                onChange={(e) => setCreateActive(e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              Rubrique active (visible sur le forum)
            </label>
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" variant="accent" disabled={saving}>
              {saving ? "Création…" : "Créer la rubrique"}
            </Button>
            <Button type="button" variant="outline" onClick={closePanels}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}

      {editingCategory ? (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-accent/30 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-primary-dark">
                Modifier « {editingCategory.name} »
              </h2>
              <p className="mt-1 text-sm text-primary/60">
                {editingCategory._count.topics} sujet
                {editingCategory._count.topics > 1 ? "s" : ""} · /forum/r/{editingCategory.slug}
              </p>
            </div>
            <button
              type="button"
              onClick={closePanels}
              className="text-sm text-primary/60 hover:text-primary-dark hover:underline"
            >
              Fermer
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input
              label="Nom"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <Input
              label="Slug"
              value={editSlug}
              onChange={(e) => setEditSlug(slugify(e.target.value))}
              required
            />
            <label className="flex items-end gap-2 pb-2 text-sm text-primary-dark md:col-span-2">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              Rubrique active (visible sur le forum)
            </label>
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="submit" variant="accent" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Button type="button" variant="outline" onClick={closePanels}>
              Annuler
            </Button>
          </div>
        </form>
      ) : null}

      {ordered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-primary-dark">Aucune rubrique trouvée</p>
          <p className="mt-2 text-sm text-primary/60">
            {searchParams.get("q") || searchParams.get("visibility")
              ? "Essayez d’élargir vos filtres ou de réinitialiser la recherche."
              : "Commencez par créer votre première rubrique forum."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(searchParams.get("q") || searchParams.get("visibility")) && (
              <Button href="/admin/forum/rubriques" variant="outline">
                Réinitialiser les filtres
              </Button>
            )}
            <Button
              href={buildRubriquesUrl(searchParams, { new: "1", edit: null })}
              variant="accent"
            >
              Créer une rubrique
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-primary/60">
            {canReorder
              ? `Glissez-déposez les lignes pour définir l’ordre d’apparition sur le forum.${reordering ? " Enregistrement…" : ""}`
              : "Réinitialisez les filtres pour réordonner les rubriques par glisser-déposer."}
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left">
                <tr>
                  {canReorder ? <th className="w-10 px-2 py-3" aria-label="Réordonner" /> : null}
                  <th className="px-4 py-3 font-medium">Rubrique</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="hidden px-4 py-3 font-medium desk-sm:table-cell">Sujets</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordered.map((category, index) => {
                  const isEditing = editingId === category.id;
                  const isDragging = draggedId === category.id;
                  const isDropTarget = dragOverId === category.id && draggedId !== category.id;

                  return (
                    <tr
                      key={category.id}
                      draggable={canReorder && !reordering}
                      onDragStart={
                        canReorder
                          ? (event) => {
                              setDraggedId(category.id);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", category.id);
                            }
                          : undefined
                      }
                      onDragOver={
                        canReorder
                          ? (event) => {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = "move";
                              if (dragOverId !== category.id) setDragOverId(category.id);
                            }
                          : undefined
                      }
                      onDragLeave={
                        canReorder
                          ? () => {
                              if (dragOverId === category.id) setDragOverId(null);
                            }
                          : undefined
                      }
                      onDrop={
                        canReorder
                          ? (event) => {
                              event.preventDefault();
                              const fromId =
                                event.dataTransfer.getData("text/plain") || draggedId;
                              setDraggedId(null);
                              setDragOverId(null);
                              if (!fromId) return;
                              const fromIndex = ordered.findIndex((item) => item.id === fromId);
                              moveCategory(fromIndex, index);
                            }
                          : undefined
                      }
                      onDragEnd={
                        canReorder
                          ? () => {
                              setDraggedId(null);
                              setDragOverId(null);
                            }
                          : undefined
                      }
                      className={[
                        isEditing ? "bg-accent/5" : "group hover:bg-gray-50/60",
                        isDragging ? "opacity-40" : "",
                        isDropTarget ? "bg-accent/10 ring-1 ring-inset ring-accent/40" : "",
                        canReorder
                          ? reordering
                            ? "cursor-wait"
                            : "cursor-grab active:cursor-grabbing"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {canReorder ? (
                        <td className="px-2 py-3 text-center text-primary/35">
                          <span
                            className="inline-flex select-none"
                            title="Glisser pour réordonner"
                            aria-hidden
                          >
                            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
                              <circle cx="5" cy="3.5" r="1.25" />
                              <circle cx="11" cy="3.5" r="1.25" />
                              <circle cx="5" cy="8" r="1.25" />
                              <circle cx="11" cy="8" r="1.25" />
                              <circle cx="5" cy="12.5" r="1.25" />
                              <circle cx="11" cy="12.5" r="1.25" />
                            </svg>
                          </span>
                        </td>
                      ) : null}
                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-primary-dark">{category.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                            /forum/r/{category.slug}
                          </p>
                          {category.description ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                              {category.description}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge isActive={category.isActive} />
                      </td>
                      <td className="hidden px-4 py-3 text-primary/70 desk-sm:table-cell">
                        {category._count.topics}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={buildRubriquesUrl(searchParams, {
                              edit: category.id,
                              new: null,
                            })}
                            className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                          >
                            {isEditing ? "En cours…" : "Éditer"}
                          </Link>
                          {category.isActive ? (
                            <Link
                              href={`/forum/r/${category.slug}`}
                              target="_blank"
                              className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                            >
                              Voir
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                            onClick={() => toggleVisibility(category)}
                          >
                            {category.isActive ? "Masquer" : "Afficher"}
                          </button>
                          <button
                            type="button"
                            className={`${tableActionClassName} ${
                              category._count.topics > 0
                                ? "cursor-not-allowed border-gray-100 bg-gray-50 text-primary/30"
                                : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                            disabled={category._count.topics > 0}
                            title={
                              category._count.topics > 0
                                ? "Déplacez ou supprimez d’abord les sujets de cette rubrique"
                                : undefined
                            }
                            onClick={() => handleDelete(category)}
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
