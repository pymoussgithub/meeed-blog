"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  reorderCategoriesAction,
  updateCategoryAction,
} from "@/actions/category.actions";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  projects: { id: string; title: string; _count: { articles: number } }[];
  articles: { articleId: string }[];
  _count: { articles: number };
};

type CategoriesManagerProps = {
  categories: CategoryRow[];
};

function buildCategoriesUrl(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const params = new URLSearchParams(searchParams.toString());
  Object.entries(updates).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const query = params.toString();
  return query ? `/admin/categories?${query}` : "/admin/categories";
}

function categoryStats(category: CategoryRow) {
  const projectArticleCount = category.projects.reduce(
    (sum, project) => sum + project._count.articles,
    0,
  );
  const publishedCount =
    category.projects.length > 0 ? projectArticleCount : category.articles.length;
  const draftCount =
    category.projects.length > 0 ? 0 : category._count.articles - category.articles.length;
  const canDelete = category.projects.length === 0 && publishedCount === 0;

  return { publishedCount, draftCount, canDelete };
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
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
  const editingCategory = categories.find((category) => category.id === editingId) ?? null;

  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createColor, setCreateColor] = useState("#4ecdc4");

  const [editName, setEditName] = useState(editingCategory?.name ?? "");
  const [editSlug, setEditSlug] = useState(editingCategory?.slug ?? "");
  const [editDescription, setEditDescription] = useState(editingCategory?.description ?? "");
  const [editColor, setEditColor] = useState(editingCategory?.color ?? "#4ecdc4");

  useEffect(() => {
    setOrdered(categories);
  }, [categories]);

  useEffect(() => {
    if (!editingId) {
      setEditName("");
      setEditSlug("");
      setEditDescription("");
      setEditColor("#4ecdc4");
      return;
    }

    const category = categories.find((item) => item.id === editingId);
    if (!category) return;

    setEditName(category.name);
    setEditSlug(category.slug);
    setEditDescription(category.description ?? "");
    setEditColor(category.color ?? "#4ecdc4");
    // Re-seed the form only when switching the edited category.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [editingId]);

  const closePanels = () => {
    router.push(
      buildCategoriesUrl(searchParams, {
        new: null,
        edit: null,
      }),
    );
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const result = await createCategoryAction({
      name: createName,
      slug: createSlug || slugify(createName),
      description: createDescription || null,
      color: createColor,
      sortOrder: categories.length,
    });
    setSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setCreateName("");
    setCreateSlug("");
    setCreateDescription("");
    setCreateColor("#4ecdc4");
    setToast({ message: "Catégorie créée.", variant: "success" });
    router.push(buildCategoriesUrl(searchParams, { new: null, edit: null }));
    router.refresh();
  };

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCategory) return;

    setSaving(true);
    const result = await updateCategoryAction(editingCategory.id, {
      name: editName,
      slug: editSlug || slugify(editName),
      description: editDescription || null,
      color: editColor,
    });
    setSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Catégorie mise à jour.", variant: "success" });
    router.push(buildCategoriesUrl(searchParams, { new: null, edit: null }));
    router.refresh();
  };

  const handleDelete = async (category: CategoryRow) => {
    const { publishedCount, draftCount, canDelete } = categoryStats(category);

    if (!canDelete) {
      await alert(
        category.projects.length > 0
          ? `Impossible de supprimer « ${category.name} » : supprimez d’abord les projets associés.`
          : `Impossible de supprimer « ${category.name} » : des articles publiés utilisent encore cette catégorie.`,
        { variant: "error", title: "Suppression impossible" },
      );
      return;
    }

    const draftWarning =
      draftCount > 0
        ? `\n\n${draftCount} brouillon${draftCount > 1 ? "s" : ""} ne ser${draftCount > 1 ? "ont" : "a"} plus catégorisé${draftCount > 1 ? "s" : ""}.`
        : "";

    const ok = await confirm(
      `Supprimer la catégorie « ${category.name} » ? Cette action est irréversible.${draftWarning}`,
      { title: "Supprimer la catégorie ?", variant: "danger", confirmLabel: "Supprimer" },
    );
    if (!ok) return;

    const result = await deleteCategoryAction(category.id);
    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Catégorie supprimée.", variant: "success" });
    if (editingId === category.id) {
      router.push(buildCategoriesUrl(searchParams, { edit: null, new: null }));
    }
    router.refresh();
  };

  const persistOrder = async (nextOrdered: CategoryRow[]) => {
    const previous = ordered;
    setOrdered(nextOrdered);
    setReordering(true);

    const result = await reorderCategoriesAction({
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
              <h2 className="text-lg font-semibold text-primary-dark">Nouvelle catégorie</h2>
              <p className="mt-1 text-sm text-primary/60">
                Le slug sert d’URL publique : /c/…
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
              placeholder={slugify(createName) || "ma-categorie"}
              required
            />
            <Input
              label="Couleur"
              type="color"
              value={createColor}
              onChange={(e) => setCreateColor(e.target.value)}
            />
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
              {saving ? "Création…" : "Créer la catégorie"}
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
                /c/{editingCategory.slug}
                {editingCategory.projects.length > 0
                  ? ` · ${editingCategory.projects.length} projet${editingCategory.projects.length > 1 ? "s" : ""}`
                  : ""}
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
            <Input
              label="Couleur"
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
            />
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
          <p className="text-lg font-medium text-primary-dark">Aucune catégorie</p>
          <p className="mt-2 text-sm text-primary/60">
            Commencez par créer votre première catégorie éditoriale.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              href={buildCategoriesUrl(searchParams, { new: "1", edit: null })}
              variant="accent"
            >
              Créer une catégorie
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-primary/60">
            Glissez-déposez les lignes pour définir l’ordre d’apparition sur le site.
            {reordering ? " Enregistrement…" : ""}
          </p>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left">
                <tr>
                  <th className="w-10 px-2 py-3" aria-label="Réordonner" />
                  <th className="px-4 py-3 font-medium">Catégorie</th>
                  <th className="hidden px-4 py-3 font-medium sm:table-cell">Contenu</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Ordre</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordered.map((category, index) => {
                  const { publishedCount, draftCount, canDelete } = categoryStats(category);
                  const isEditing = editingId === category.id;
                  const isDragging = draggedId === category.id;
                  const isDropTarget = dragOverId === category.id && draggedId !== category.id;

                  return (
                    <tr
                      key={category.id}
                      draggable={!reordering}
                      onDragStart={(event) => {
                        setDraggedId(category.id);
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData("text/plain", category.id);
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                        if (dragOverId !== category.id) setDragOverId(category.id);
                      }}
                      onDragLeave={() => {
                        if (dragOverId === category.id) setDragOverId(null);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const fromId = event.dataTransfer.getData("text/plain") || draggedId;
                        setDraggedId(null);
                        setDragOverId(null);
                        if (!fromId) return;
                        const fromIndex = ordered.findIndex((item) => item.id === fromId);
                        moveCategory(fromIndex, index);
                      }}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                      }}
                      className={[
                        isEditing ? "bg-accent/5" : "group hover:bg-gray-50/60",
                        isDragging ? "opacity-40" : "",
                        isDropTarget ? "bg-accent/10 ring-1 ring-inset ring-accent/40" : "",
                        reordering ? "cursor-wait" : "cursor-grab active:cursor-grabbing",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <td className="px-2 py-3 text-center text-primary/35">
                        <span
                          className="inline-flex select-none"
                          title="Glisser pour réordonner"
                          aria-hidden
                        >
                          <svg
                            viewBox="0 0 16 16"
                            className="size-4"
                            fill="currentColor"
                          >
                            <circle cx="5" cy="3.5" r="1.25" />
                            <circle cx="11" cy="3.5" r="1.25" />
                            <circle cx="5" cy="8" r="1.25" />
                            <circle cx="11" cy="8" r="1.25" />
                            <circle cx="5" cy="12.5" r="1.25" />
                            <circle cx="11" cy="12.5" r="1.25" />
                          </svg>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className="mt-1 size-3.5 shrink-0 rounded-full border border-black/10"
                            style={{ backgroundColor: category.color ?? "#4ecdc4" }}
                            title={category.color ?? "#4ecdc4"}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-primary-dark">{category.name}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                              /c/{category.slug}
                            </p>
                            {category.description ? (
                              <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                                {category.description}
                              </p>
                            ) : null}
                            {category.projects.length > 0 ? (
                              <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                                Projet{category.projects.length > 1 ? "s" : ""} :{" "}
                                {category.projects.map((project) => project.title).join(", ")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-primary/70 sm:table-cell">
                        {publishedCount > 0 || draftCount > 0 ? (
                          <span>
                            {publishedCount} publié{publishedCount > 1 ? "s" : ""}
                            {draftCount > 0
                              ? `, ${draftCount} brouillon${draftCount > 1 ? "s" : ""}`
                              : ""}
                          </span>
                        ) : (
                          <span className="text-primary/40">—</span>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 text-primary/70 md:table-cell">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={buildCategoriesUrl(searchParams, {
                              edit: category.id,
                              new: null,
                            })}
                            className={`${tableActionClassName} border-gray-200 bg-white text-primary-dark hover:border-accent/40 hover:bg-accent/5`}
                          >
                            {isEditing ? "En cours…" : "Éditer"}
                          </Link>
                          <Link
                            href={`/c/${category.slug}`}
                            target="_blank"
                            className={`${tableActionClassName} border-gray-200 bg-white text-primary/70 hover:border-accent/40 hover:text-accent-dark`}
                          >
                            Voir
                          </Link>
                          <button
                            type="button"
                            className={`${tableActionClassName} ${
                              canDelete
                                ? "border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50"
                                : "cursor-not-allowed border-gray-100 bg-gray-50 text-primary/30"
                            }`}
                            disabled={!canDelete}
                            title={
                              category.projects.length > 0
                                ? "Supprimez d’abord les projets associés"
                                : publishedCount > 0
                                  ? "Des articles publiés utilisent cette catégorie"
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
