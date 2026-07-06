"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/actions/category.actions";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  project: { id: string; title: string } | null;
  articles: { articleId: string }[];
  _count: { articles: number };
};

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const { confirm, alert } = useDialog();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4ecdc4");

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await createCategoryAction({
      name,
      slug: slug || slugify(name),
      description: description || null,
      color,
      sortOrder: categories.length,
    });

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setName("");
    setSlug("");
    setDescription("");
    setToast({ message: "Catégorie créée.", variant: "success" });
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="font-semibold">Nouvelle catégorie</h2>
        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder={slugify(name) || "ma-categorie"}
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          label="Couleur"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <Button type="submit" variant="accent">
          Créer
        </Button>
      </form>

      <div className="space-y-4">
        {categories.map((category) => {
          const publishedCount = category.articles.length;
          const draftCount = category._count.articles - publishedCount;
          const canDelete = !category.project && publishedCount === 0;

          return (
          <div
            key={category.id}
            className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto_auto_1fr_auto]"
          >
            <Input
              defaultValue={category.name}
              onBlur={async (event) => {
                await updateCategoryAction(category.id, { name: event.target.value });
                router.refresh();
              }}
            />
            <Input
              defaultValue={category.slug}
              onBlur={async (event) => {
                await updateCategoryAction(category.id, { slug: slugify(event.target.value) });
                router.refresh();
              }}
            />
            <Input
              type="number"
              defaultValue={category.sortOrder}
              onBlur={async (event) => {
                await updateCategoryAction(category.id, {
                  sortOrder: Number(event.target.value),
                });
                router.refresh();
              }}
            />
            <Input
              type="color"
              defaultValue={category.color ?? "#4ecdc4"}
              onBlur={async (event) => {
                await updateCategoryAction(category.id, { color: event.target.value });
                router.refresh();
              }}
            />
            <div className="self-center space-y-1 text-sm text-primary/60">
              <div>/c/{category.slug}</div>
              {category.project ? (
                <div>Projet : {category.project.title}</div>
              ) : null}
              {category._count.articles > 0 ? (
                <div>
                  {publishedCount} publié{publishedCount > 1 ? "s" : ""}
                  {draftCount > 0 ? `, ${draftCount} brouillon${draftCount > 1 ? "s" : ""}` : ""}
                </div>
              ) : null}
            </div>
            <div className="self-center">
              <button
                type="button"
                className={
                  canDelete
                    ? "text-red-600 hover:underline"
                    : "cursor-not-allowed text-primary/30"
                }
                disabled={!canDelete}
                title={
                  category.project
                    ? "Supprimez d'abord le projet associé"
                    : publishedCount > 0
                      ? "Des articles publiés utilisent cette catégorie"
                      : undefined
                }
                onClick={async () => {
                  if (!canDelete) return;

                  const draftWarning =
                    draftCount > 0
                      ? `\n\n${draftCount} brouillon${draftCount > 1 ? "s" : ""} ne ser${draftCount > 1 ? "ont" : "a"} plus catégorisé${draftCount > 1 ? "s" : ""}.`
                      : "";

                  if (
                    !(await confirm(
                      `Supprimer la catégorie « ${category.name} » ? Cette action est irréversible.${draftWarning}`,
                      { variant: "danger", confirmLabel: "Supprimer" },
                    ))
                  ) {
                    return;
                  }

                  const result = await deleteCategoryAction(category.id);
                  if (!result.success) {
                    await alert(result.error, { variant: "error" });
                    return;
                  }

                  setToast({ message: "Catégorie supprimée.", variant: "success" });
                  router.refresh();
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        );
        })}
      </div>

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
