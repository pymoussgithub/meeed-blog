"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createProjectAction, deleteProjectAction, updateProjectAction } from "@/actions/project.actions";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { slugify } from "@/lib/utils";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string | null;
  donationUrl: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  category: {
    _count: { articles: number };
  };
};

export function ProjectsManager({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [donationUrl, setDonationUrl] = useState("");
  const [color, setColor] = useState("#4ecdc4");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await createProjectAction({
      title,
      slug: slug || slugify(title),
      summary,
      description: description || null,
      donationUrl: donationUrl || null,
      color,
      sortOrder: projects.length,
      isActive: true,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setTitle("");
    setSlug("");
    setSummary("");
    setDescription("");
    setDonationUrl("");
    setToast({ message: "Projet créé.", variant: "success" });
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCreate}
        className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-5"
      >
        <h2 className="font-semibold">Nouveau projet</h2>
        <p className="text-sm text-primary/60">
          Chaque projet crée automatiquement une catégorie. Les contributeurs pourront y
          rattacher leurs articles.
        </p>
        <Input
          label="Titre"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slug) {
              setSlug(slugify(e.target.value));
            }
          }}
          required
        />
        <Input
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          placeholder={slugify(title) || "mon-projet"}
        />
        <Textarea
          label="Résumé court"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Visible sur la page Projets (500 caractères max)"
          required
        />
        <Textarea
          label="Description détaillée (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Texte complémentaire pour la fiche projet"
        />
        <Input
          label="Lien de don HelloAsso (optionnel)"
          value={donationUrl}
          onChange={(e) => setDonationUrl(e.target.value)}
          placeholder="https://www.helloasso.com/..."
        />
        <Input
          label="Couleur"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <Button type="submit" variant="accent" disabled={isSubmitting}>
          {isSubmitting ? "Création…" : "Créer le projet"}
        </Button>
      </form>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm text-primary/60">Aucun projet pour le moment.</p>
        ) : null}

        {projects.map((project) => (
          <div
            key={project.id}
            className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{project.title}</h3>
                <p className="mt-1 text-sm text-primary/60">
                  /projets · /c/{project.slug} · {project.category._count.articles} article
                  {project.category._count.articles > 1 ? "s" : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  defaultChecked={project.isActive}
                  onChange={async (event) => {
                    const result = await updateProjectAction(project.id, {
                      isActive: event.target.checked,
                    });
                    if (!result.success) {
                      setToast({ message: result.error, variant: "error" });
                      event.target.checked = !event.target.checked;
                      return;
                    }
                    router.refresh();
                  }}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                Visible sur le site
              </label>
              <button
                type="button"
                className="text-sm text-red-600 hover:underline"
                onClick={async () => {
                  const articleCount = project.category._count.articles;
                  const articleWarning =
                    articleCount > 0
                      ? `\n\nAttention : ${articleCount} article${articleCount > 1 ? "s" : ""} associé${articleCount > 1 ? "s" : ""} à ce projet seront également supprimé${articleCount > 1 ? "s" : ""} définitivement.`
                      : "";

                  if (
                    !(await confirm(
                      `Supprimer définitivement le projet « ${project.title} » ? Cette action est irréversible.${articleWarning}`,
                      { variant: "danger", confirmLabel: "Supprimer" },
                    ))
                  ) {
                    return;
                  }

                  const result = await deleteProjectAction(project.id);
                  if (!result.success) {
                    setToast({ message: result.error, variant: "error" });
                    return;
                  }

                  setToast({ message: "Projet supprimé.", variant: "success" });
                  router.refresh();
                }}
              >
                Supprimer le projet
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Titre"
                defaultValue={project.title}
                onBlur={async (event) => {
                  if (event.target.value === project.title) return;
                  const result = await updateProjectAction(project.id, {
                    title: event.target.value,
                  });
                  if (!result.success) {
                    setToast({ message: result.error, variant: "error" });
                    return;
                  }
                  router.refresh();
                }}
              />
              <Input
                label="Slug"
                defaultValue={project.slug}
                onBlur={async (event) => {
                  const nextSlug = slugify(event.target.value);
                  if (nextSlug === project.slug) return;
                  const result = await updateProjectAction(project.id, { slug: nextSlug });
                  if (!result.success) {
                    setToast({ message: result.error, variant: "error" });
                    event.target.value = project.slug;
                    return;
                  }
                  router.refresh();
                }}
              />
            </div>

            <Textarea
              label="Résumé"
              defaultValue={project.summary}
              onBlur={async (event) => {
                if (event.target.value === project.summary) return;
                const result = await updateProjectAction(project.id, {
                  summary: event.target.value,
                });
                if (!result.success) {
                  setToast({ message: result.error, variant: "error" });
                  return;
                }
                router.refresh();
              }}
            />

            <Input
              label="Lien de don"
              defaultValue={project.donationUrl ?? ""}
              placeholder="https://www.helloasso.com/..."
              onBlur={async (event) => {
                const value = event.target.value.trim();
                if (value === (project.donationUrl ?? "")) return;
                const result = await updateProjectAction(project.id, {
                  donationUrl: value || null,
                });
                if (!result.success) {
                  setToast({ message: result.error, variant: "error" });
                  return;
                }
                router.refresh();
              }}
            />

            <div className="flex flex-wrap items-center gap-4">
              <Input
                label="Couleur"
                type="color"
                defaultValue={project.color ?? "#4ecdc4"}
                onBlur={async (event) => {
                  const result = await updateProjectAction(project.id, {
                    color: event.target.value,
                  });
                  if (!result.success) {
                    setToast({ message: result.error, variant: "error" });
                    return;
                  }
                  router.refresh();
                }}
              />
              <Input
                label="Ordre"
                type="number"
                defaultValue={project.sortOrder}
                onBlur={async (event) => {
                  const result = await updateProjectAction(project.id, {
                    sortOrder: Number(event.target.value),
                  });
                  if (!result.success) {
                    setToast({ message: result.error, variant: "error" });
                    return;
                  }
                  router.refresh();
                }}
              />
              <Link
                href={`/c/${project.slug}`}
                target="_blank"
                className="self-end text-sm font-medium text-accent-dark hover:underline"
              >
                Voir les articles →
              </Link>
            </div>
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
