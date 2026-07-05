"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  archiveArticleAction,
  deleteArticleAction,
  publishArticleAction,
  saveDraftAction,
} from "@/actions/article.actions";
import { ArticleStatusBadge } from "@/components/admin/ArticleStatusBadge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { isHtmlContentEmpty } from "@/lib/editor-utils";
import {
  getFirstZodErrorMessage,
  normalizeArticleFormInput,
  publishArticleSchema,
  type ArticleFormInput,
} from "@/lib/validations/article";
import { cn, slugify } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  isProject?: boolean;
};

type ArticleFormProps = {
  categories: CategoryOption[];
  articleId?: string;
  initialData?: Partial<ArticleFormInput>;
  isNew?: boolean;
};

const defaultForm: ArticleFormInput = {
  title: "",
  slug: "",
  excerpt: "",
  content: "<p></p>",
  coverImageUrl: null,
  coverImagePublicId: null,
  status: "DRAFT",
  categoryIds: [],
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

export function ArticleForm({
  categories,
  articleId,
  initialData,
  isNew = false,
}: ArticleFormProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [form, setForm] = useState<ArticleFormInput>(
    normalizeArticleFormInput({ ...defaultForm, ...initialData }),
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

  const updateField = <K extends keyof ArticleFormInput>(key: K, value: ArticleFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  };

  const validateBeforeSave = () => {
    if (!form.title.trim()) {
      setToast({ message: "Le titre est requis.", variant: "error" });
      return false;
    }

    if (isHtmlContentEmpty(form.content)) {
      setToast({ message: "Le corps de l'article ne peut pas être vide.", variant: "error" });
      return false;
    }

    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateBeforeSave()) return;

    setIsSaving(true);
    const result = await saveDraftAction(articleId ?? null, form);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Brouillon enregistré.", variant: "success" });
    if (!articleId) {
      router.push(`/admin/articles/${result.data.id}`);
    } else {
      router.refresh();
    }
  };

  const handlePublish = async () => {
    const normalizedForm = normalizeArticleFormInput(form);
    const validation = publishArticleSchema.safeParse({
      ...normalizedForm,
      status: "PUBLISHED",
    });
    if (!validation.success) {
      setToast({
        message: getFirstZodErrorMessage(validation.error),
        variant: "error",
      });
      return;
    }

    setIsSaving(true);
    const result = await publishArticleAction(articleId ?? null, normalizedForm);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Article publié !", variant: "success" });
    router.push(`/admin/articles/${result.data.id}`);
    router.refresh();
  };

  const handleArchive = async () => {
    if (!articleId) return;
    if (
      !(await confirm("Archiver cet article ? Il ne sera plus visible sur le site.", {
        variant: "danger",
        confirmLabel: "Archiver",
      }))
    ) {
      return;
    }

    setIsSaving(true);
    const result = await archiveArticleAction(articleId);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setForm((current) => ({ ...current, status: "ARCHIVED" }));
    setToast({ message: "Article archivé.", variant: "success" });
    router.refresh();
  };

  const handleRepublish = async () => {
    if (!articleId) return;

    const normalizedForm = normalizeArticleFormInput({ ...form, status: "PUBLISHED" });
    const validation = publishArticleSchema.safeParse(normalizedForm);
    if (!validation.success) {
      setToast({
        message: getFirstZodErrorMessage(validation.error),
        variant: "error",
      });
      return;
    }

    if (!(await confirm("Republier cet article ?"))) return;

    setIsSaving(true);
    const result = await publishArticleAction(articleId, normalizedForm);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setForm((current) => ({ ...current, status: "PUBLISHED" }));
    setToast({ message: "Article republié !", variant: "success" });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!articleId) return;
    if (
      !(await confirm(
        "Supprimer définitivement cet article ? Cette action est irréversible.",
        { variant: "danger", confirmLabel: "Supprimer" },
      ))
    ) {
      return;
    }

    setIsSaving(true);
    const result = await deleteArticleAction(articleId);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Article supprimé.", variant: "success" });
    router.push("/admin/articles");
    router.refresh();
  };

  const excerptLength = form.excerpt.length;
  const excerptTone =
    excerptLength === 0
      ? "text-primary/50"
      : excerptLength <= 160
        ? "text-accent-dark"
        : "text-amber-600";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
        <Link
          href="/admin/articles"
          className="text-xs text-primary/60 transition-colors hover:text-accent-dark"
        >
          ← Retour aux articles
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <ArticleStatusBadge status={form.status} />
          {form.status !== "ARCHIVED" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleSaveDraft}
                className="!px-4 !py-2 text-xs"
              >
                {isSaving ? "Enregistrement…" : "Enregistrer brouillon"}
              </Button>
              <Button
                type="button"
                variant="accent"
                disabled={isSaving}
                onClick={handlePublish}
                className="!px-4 !py-2 text-xs"
              >
                {form.status === "PUBLISHED" ? "Mettre à jour" : "Publier"}
              </Button>
              {articleId ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={handleArchive}
                  className="!px-4 !py-2 text-xs"
                >
                  Archiver
                </Button>
              ) : null}
              {articleId && form.status === "PUBLISHED" && form.slug ? (
                <Button
                  href={`/a/${form.slug}`}
                  external
                  variant="outline"
                  className="!px-4 !py-2 text-xs"
                >
                  Aperçu public
                </Button>
              ) : null}
            </>
          ) : null}
          {articleId && form.status === "ARCHIVED" ? (
            <>
              <Button
                type="button"
                variant="accent"
                disabled={isSaving}
                onClick={handleRepublish}
                className="!px-4 !py-2 text-xs"
              >
                Republier
              </Button>
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
          {/* 1. Titre — cadre dédié */}
          <section className="rounded-lg border-2 border-accent/25 bg-bg-soft/50 p-4 shadow-sm">
            <label
              htmlFor="article-title"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-accent-dark"
            >
              Titre de l&apos;article
            </label>
            <input
              id="article-title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Saisissez le titre ici…"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-lg font-bold text-primary-dark placeholder:text-primary/35 shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-xl"
              style={{ fontFamily: "var(--font-heading)" }}
            />
            <p className="mt-2 text-xs text-primary/55">
              Affiché en une sur le site, les listes et le partage social.
            </p>
          </section>

          {/* 2. Catégories + couverture (avant la rédaction) */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormSection
              title="Catégories"
              description="Au moins une requise pour publier"
            >
              {categories.some((category) => category.isProject) ? (
                <div className="mb-3">
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-primary/45">
                    Projets
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories
                      .filter((category) => category.isProject)
                      .map((category) => (
                        <CategoryChip
                          key={category.id}
                          label={category.name}
                          selected={form.categoryIds.includes(category.id)}
                          onClick={() => toggleCategory(category.id)}
                        />
                      ))}
                  </div>
                </div>
              ) : null}

              {categories.some((category) => !category.isProject) ? (
                <div>
                  {categories.some((category) => category.isProject) ? (
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-primary/45">
                      Thématiques
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-1.5">
                    {categories
                      .filter((category) => !category.isProject)
                      .map((category) => (
                        <CategoryChip
                          key={category.id}
                          label={category.name}
                          selected={form.categoryIds.includes(category.id)}
                          onClick={() => toggleCategory(category.id)}
                        />
                      ))}
                  </div>
                </div>
              ) : null}
            </FormSection>

            <FormSection
              title="Image de couverture"
              description="Obligatoire pour publier · format 16:9"
            >
              <ImageUpload
                purpose="cover"
                articleId={articleId}
                initialUrl={form.coverImageUrl}
                initialPublicId={form.coverImagePublicId}
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
          </div>

          {/* 3. Extrait */}
          <FormSection
            title="Résumé & partage"
            description="120–160 caractères pour WhatsApp et les réseaux"
          >
            <Textarea
              label="Extrait"
              value={form.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              maxLength={300}
              placeholder="Un court résumé accrocheur…"
              className="min-h-20 text-sm"
            />
            <p className={cn("mt-1 text-xs", excerptTone)}>
              {excerptLength} / 160 recommandé
              {excerptLength > 160 ? " · trop long pour le partage social" : ""}
            </p>
          </FormSection>

          {/* 4. Corps de l'article */}
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-primary-dark">Corps de l&apos;article</h3>
              <p className="mt-0.5 text-xs text-primary/60">Rédigez le contenu principal ici</p>
            </div>
            <TipTapEditor
              content={form.content}
              onChange={(html) => updateField("content", html)}
              articleId={articleId}
            />
          </section>

          {/* 5. URL — en dernier */}
          <FormSection
            title="URL & référencement"
            description="Adresse personnalisée de l'article"
          >
            <Input
              label="URL (slug)"
              value={form.slug}
              onChange={(event) => {
                setSlugLocked(true);
                updateField("slug", slugify(event.target.value));
              }}
              placeholder="mon-article"
            />
            <p className="mt-2 text-xs text-primary/50">
              Adresse publique :{" "}
              <span className="font-mono text-primary/70">/a/{form.slug || "…"}</span>
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

function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
        selected
          ? "bg-accent text-white shadow-sm"
          : "bg-gray-100 text-primary/70 hover:bg-bg-soft hover:text-accent-dark",
      )}
    >
      {label}
    </button>
  );
}
