"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "@/actions/project.actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { ProjectStatusBadge } from "@/components/admin/ProjectStatusBadge";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import {
  createProjectSchema,
  normalizeProjectFormInput,
  type ProjectFormInput,
} from "@/lib/validations/project";
import { cn, slugify } from "@/lib/utils";

type ProjectFormProps = {
  projectId?: string;
  articleCount?: number;
  initialData?: Partial<ProjectFormInput>;
  isNew?: boolean;
  defaultSortOrder?: number;
};

const defaultForm: ProjectFormInput = {
  title: "",
  slug: "",
  summary: "",
  description: null,
  donationUrl: null,
  coverImageUrl: null,
  coverImagePublicId: null,
  color: "#4ecdc4",
  sortOrder: 0,
  isActive: true,
};

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-primary-dark">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-primary/60">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function ProjectForm({
  projectId,
  articleCount = 0,
  initialData,
  isNew = false,
  defaultSortOrder = 0,
}: ProjectFormProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [form, setForm] = useState<ProjectFormInput>(
    normalizeProjectFormInput({
      ...defaultForm,
      sortOrder: defaultSortOrder,
      ...initialData,
    }),
  );
  const [slugLocked, setSlugLocked] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  useEffect(() => {
    if (!slugLocked && isNew && form.title) {
      setForm((current) => ({ ...current, slug: slugify(form.title) }));
    }
  }, [form.title, isNew, slugLocked]);

  const updateField = <K extends keyof ProjectFormInput>(key: K, value: ProjectFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const normalizedForm = normalizeProjectFormInput(form);
    const validation = createProjectSchema.safeParse(normalizedForm);

    if (!validation.success) {
      setToast({
        message: validation.error.errors[0]?.message ?? "Données invalides",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);

    const result = projectId
      ? await updateProjectAction(projectId, validation.data)
      : await createProjectAction(validation.data);

    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: projectId ? "Projet enregistré." : "Projet créé.", variant: "success" });

    if (!projectId && result.data) {
      router.push(`/admin/projets/${result.data.id}`);
    } else {
      router.refresh();
    }
  };

  const handleToggleVisibility = async () => {
    if (!projectId) return;

    setIsSaving(true);
    const result = await updateProjectAction(projectId, { isActive: !form.isActive });
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setForm((current) => ({ ...current, isActive: !current.isActive }));
    setToast({
      message: form.isActive ? "Projet masqué du site." : "Projet visible sur le site.",
      variant: "success",
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!projectId) return;

    const articleWarning =
      articleCount > 0
        ? `\n\nAttention : ${articleCount} article${articleCount > 1 ? "s" : ""} associé${articleCount > 1 ? "s" : ""} à ce projet seront également supprimé${articleCount > 1 ? "s" : ""} définitivement.`
        : "";

    if (
      !(await confirm(
        `Supprimer définitivement le projet « ${form.title} » ? Cette action est irréversible.${articleWarning}`,
        { variant: "danger", confirmLabel: "Supprimer" },
      ))
    ) {
      return;
    }

    setIsSaving(true);
    const result = await deleteProjectAction(projectId);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Projet supprimé.", variant: "success" });
    router.push("/admin/projets");
    router.refresh();
  };

  const summaryLength = form.summary.length;
  const summaryTone =
    summaryLength === 0
      ? "text-primary/50"
      : summaryLength <= 500
        ? "text-accent-dark"
        : "text-amber-600";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
        <Link
          href="/admin/projets"
          className="text-xs text-primary/60 transition-colors hover:text-accent-dark"
        >
          ← Retour aux projets
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <ProjectStatusBadge isActive={form.isActive} />
          <Button
            type="button"
            variant="accent"
            disabled={isSaving}
            onClick={handleSave}
            className="!px-4 !py-2 text-xs"
          >
            {isSaving ? "Enregistrement…" : projectId ? "Enregistrer" : "Créer le projet"}
          </Button>
          {projectId ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleToggleVisibility}
                className="!px-4 !py-2 text-xs"
              >
                {form.isActive ? "Masquer" : "Afficher"}
              </Button>
              {form.isActive && form.slug ? (
                <>
                  <Button
                    href="/projets"
                    external
                    variant="outline"
                    className="!px-4 !py-2 text-xs"
                  >
                    Page projets
                  </Button>
                  <Button
                    href={`/c/${form.slug}`}
                    external
                    variant="outline"
                    className="!px-4 !py-2 text-xs"
                  >
                    Voir les articles
                  </Button>
                </>
              ) : null}
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleDelete}
                className="!border-red-200 !px-4 !py-2 text-xs !text-red-600 hover:!bg-red-50"
              >
                Supprimer
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <section className="rounded-lg border-2 border-accent/25 bg-bg-soft/50 p-4 shadow-sm">
          <label
            htmlFor="project-title"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-accent-dark"
          >
            Titre du projet
          </label>
          <input
            id="project-title"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Saisissez le titre ici…"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-lg font-bold text-primary-dark placeholder:text-primary/35 shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-xl"
            style={{ fontFamily: "var(--font-heading)" }}
          />
          <p className="mt-2 text-xs text-primary/55">
            Affiché sur la page Projets et comme nom de la catégorie associée.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <FormSection
            title="Image du projet"
            description="Format recommandé : 16:10 (ex. 960×600 px)"
          >
            <ImageUpload
              purpose="project-cover"
              projectId={projectId}
              initialUrl={form.coverImageUrl}
              initialPublicId={form.coverImagePublicId}
              hint="Affichée sur la page Projets et les cartes de présentation."
              onUploaded={(metadata) => {
                setForm((current) => ({
                  ...current,
                  coverImageUrl: metadata.url,
                  coverImagePublicId: metadata.publicId,
                }));
              }}
              onRemoved={() => {
                setForm((current) => ({
                  ...current,
                  coverImageUrl: null,
                  coverImagePublicId: null,
                }));
              }}
            />
          </FormSection>

          <FormSection
            title="Apparence & ordre"
            description="Couleur d'accent et position dans la liste"
          >
            <div className="space-y-3">
              <Input
                label="Couleur"
                type="color"
                value={form.color ?? "#4ecdc4"}
                onChange={(event) => updateField("color", event.target.value)}
              />
              <Input
                label="Ordre d'affichage"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(event) => updateField("sortOrder", Number(event.target.value))}
              />
            </div>
          </FormSection>
        </div>

        <FormSection
          title="Résumé court"
          description="Visible sur la page Projets (500 caractères max)"
        >
          <Textarea
            label="Résumé"
            value={form.summary}
            onChange={(event) => updateField("summary", event.target.value)}
            maxLength={500}
            placeholder="Décrivez brièvement le projet…"
            className="min-h-24 text-sm"
            required
          />
          <p className={cn("mt-1 text-xs", summaryTone)}>{summaryLength} / 500</p>
        </FormSection>

        <FormSection
          title="Description détaillée"
          description="Texte complémentaire pour la fiche projet (optionnel)"
        >
          <Textarea
            label="Description"
            value={form.description ?? ""}
            onChange={(event) => updateField("description", event.target.value || null)}
            placeholder="Informations complémentaires sur le projet…"
            className="min-h-32 text-sm"
          />
        </FormSection>

        <FormSection
          title="Financement"
          description="Lien HelloAsso ou autre plateforme de don (optionnel)"
        >
          <Input
            label="Lien de don"
            value={form.donationUrl ?? ""}
            onChange={(event) => updateField("donationUrl", event.target.value || null)}
            placeholder="https://www.helloasso.com/..."
          />
        </FormSection>

        <FormSection title="URL & référencement" description="Adresse de la catégorie associée">
          <Input
            label="URL (slug)"
            value={form.slug}
            onChange={(event) => {
              setSlugLocked(true);
              updateField("slug", slugify(event.target.value));
            }}
            placeholder="mon-projet"
          />
          <p className="mt-2 text-xs text-primary/50">
            Catégorie : <span className="font-mono text-primary/70">/c/{form.slug || "…"}</span>
          </p>
          {isNew ? (
            <button
              type="button"
              className="mt-2 text-xs text-accent-dark hover:underline"
              onClick={() => setSlugLocked(false)}
            >
              Regénérer depuis le titre
            </button>
          ) : null}
        </FormSection>

        {!isNew ? (
          <FormSection title="Informations">
            <p className="text-sm text-primary/70">
              {articleCount} article{articleCount > 1 ? "s" : ""} rattaché
              {articleCount > 1 ? "s" : ""} à ce projet via sa catégorie.
            </p>
          </FormSection>
        ) : (
          <FormSection title="À propos">
            <p className="text-sm text-primary/70">
              Chaque projet crée automatiquement une catégorie. Les contributeurs pourront y
              rattacher leurs articles.
            </p>
          </FormSection>
        )}
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
