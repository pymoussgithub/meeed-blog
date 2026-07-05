"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategoryAction, updateCategoryAction } from "@/actions/category.actions";
import { Button } from "@/components/ui/Button";
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
};

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
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
        {categories.map((category) => (
          <div
            key={category.id}
            className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-5"
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
            <span className="self-center text-sm text-primary/60">/c/{category.slug}</span>
          </div>
        ))}
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
