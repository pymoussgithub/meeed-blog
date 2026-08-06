"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  archiveArticleAction,
  deleteArticleAction,
  publishArticleAction,
  saveDraftAction,
} from "@/actions/article.actions";
import {
  createLinkedForumTopicAction,
  linkArticleForumTopicAction,
} from "@/actions/article-forum.actions";
import {
  AssociateForumTopicPicker,
  type AssociableForumTopic,
} from "@/components/admin/AssociateForumTopicPicker";
import { ArticleStatusBadge } from "@/components/admin/ArticleStatusBadge";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { ComposerPanel } from "@/components/editor/ComposerPanel";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Toast } from "@/components/ui/Toast";
import { countEditorWords, isHtmlContentEmpty } from "@/lib/editor-utils";
import {
  getFirstZodErrorMessage,
  normalizeArticleFormInput,
  publishArticleSchema,
  type ArticleFormInput,
} from "@/lib/validations/article";
import { cn, slugify } from "@/lib/utils";
import { emitTourSuccess } from "@/lib/tour/validation";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type ForumCategoryOption = {
  id: string;
  name: string;
};

type PendingLinkedTopicDraft = {
  localId: string;
  title: string;
  categoryId: string;
  body: string;
};

type ArticleFormProps = {
  categories: CategoryOption[];
  articleId?: string;
  initialData?: Partial<ArticleFormInput>;
  isNew?: boolean;
  forumLinkOptions?: {
    categories: ForumCategoryOption[];
    browsableTopics: AssociableForumTopic[];
  };
  /** Panneau forum (édition) — rendu dans la colonne principale, au-dessus de « Avant de publier ». */
  forumLinksPanel?: React.ReactNode;
};

const AUTOSAVE_DELAY_MS = 1600;

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

function hasMeaningfulDraftContent(form: ArticleFormInput) {
  return (
    form.title.trim().length > 0 ||
    form.excerpt.trim().length > 0 ||
    form.slug.trim().length > 0 ||
    !isHtmlContentEmpty(form.content) ||
    Boolean(form.coverImageUrl) ||
    form.categoryIds.length > 0
  );
}

function snapshotForm(form: ArticleFormInput) {
  return JSON.stringify(form);
}

function FormSection({
  title,
  description,
  children,
  "data-tour-id": dataTourId,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  "data-tour-id"?: string;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4" data-tour-id={dataTourId}>
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
  forumLinkOptions,
  forumLinksPanel,
}: ArticleFormProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [form, setForm] = useState<ArticleFormInput>(
    normalizeArticleFormInput({ ...defaultForm, ...initialData }),
  );
  const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(articleId);
  const [slugLocked, setSlugLocked] = useState(!isNew);
  const [isCreatingNew, setIsCreatingNew] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const [pendingLinkedTopicIds, setPendingLinkedTopicIds] = useState<string[]>([]);
  const [linkedTopicDraftTitle, setLinkedTopicDraftTitle] = useState("");
  const [linkedTopicDraftCategoryId, setLinkedTopicDraftCategoryId] = useState(
    forumLinkOptions?.categories[0]?.id ?? "",
  );
  const [linkedTopicDraftBody, setLinkedTopicDraftBody] = useState("<p></p>");
  const [pendingCreatedTopics, setPendingCreatedTopics] = useState<PendingLinkedTopicDraft[]>([]);

  const formRef = useRef(form);
  const currentArticleIdRef = useRef(currentArticleId);
  const pendingLinkedTopicIdsRef = useRef(pendingLinkedTopicIds);
  const pendingCreatedTopicsRef = useRef(pendingCreatedTopics);
  const lastSavedSnapshotRef = useRef(snapshotForm(form));
  const saveInFlightRef = useRef(false);
  const pendingAutosaveRef = useRef(false);
  const autosaveReadyRef = useRef(false);
  const persistDraftRef = useRef<(options?: { manual?: boolean }) => Promise<boolean>>(
    async () => false,
  );

  formRef.current = form;
  currentArticleIdRef.current = currentArticleId;
  pendingLinkedTopicIdsRef.current = pendingLinkedTopicIds;
  pendingCreatedTopicsRef.current = pendingCreatedTopics;

  useEffect(() => {
    if (!slugLocked && isCreatingNew && form.title) {
      setForm((current) => ({ ...current, slug: slugify(form.title) }));
    }
  }, [form.title, isCreatingNew, slugLocked]);

  useEffect(() => {
    if (!linkedTopicDraftCategoryId && forumLinkOptions?.categories[0]?.id) {
      setLinkedTopicDraftCategoryId(forumLinkOptions.categories[0].id);
    }
  }, [forumLinkOptions, linkedTopicDraftCategoryId]);

  const updateField = <K extends keyof ArticleFormInput>(key: K, value: ArticleFormInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetLinkedTopicDraft = () => {
    setLinkedTopicDraftTitle("");
    setLinkedTopicDraftBody("<p></p>");
    setLinkedTopicDraftCategoryId(forumLinkOptions?.categories[0]?.id ?? "");
  };

  const attachDeferredForumLinks = async (nextArticleId: string) => {
    const topicIds = pendingLinkedTopicIdsRef.current;
    const createdTopics = pendingCreatedTopicsRef.current;

    for (const topicId of topicIds) {
      const result = await linkArticleForumTopicAction({ articleId: nextArticleId, topicId });
      if (!result.success) {
        return result.error;
      }
    }

    for (const topic of createdTopics) {
      const result = await createLinkedForumTopicAction(nextArticleId, {
        title: topic.title,
        categoryId: topic.categoryId,
        body: topic.body,
      });
      if (!result.success) {
        return result.error;
      }
    }

    if (topicIds.length > 0) setPendingLinkedTopicIds([]);
    if (createdTopics.length > 0) setPendingCreatedTopics([]);

    return null;
  };

  const persistDraft = async (options: { manual?: boolean } = {}) => {
    const manual = Boolean(options.manual);
    const currentForm = formRef.current;

    if (currentForm.status === "PUBLISHED" || currentForm.status === "ARCHIVED") {
      return false;
    }

    if (!manual && !hasMeaningfulDraftContent(currentForm)) {
      return false;
    }

    const snapshot = snapshotForm(currentForm);
    const hasPendingForumLinks =
      pendingLinkedTopicIdsRef.current.length > 0 || pendingCreatedTopicsRef.current.length > 0;
    if (!manual && snapshot === lastSavedSnapshotRef.current && !hasPendingForumLinks) {
      return false;
    }

    if (saveInFlightRef.current) {
      pendingAutosaveRef.current = true;
      return false;
    }

    saveInFlightRef.current = true;
    setIsSaving(true);

    try {
      const result = await saveDraftAction(currentArticleIdRef.current ?? null, currentForm);

      if (!result.success) {
        setToast({ message: result.error, variant: "error" });
        return false;
      }

      lastSavedSnapshotRef.current = snapshot;

      if (!currentArticleIdRef.current) {
        setCurrentArticleId(result.data.id);
        currentArticleIdRef.current = result.data.id;
        setIsCreatingNew(false);
        setSlugLocked(true);
        window.history.replaceState(null, "", `/admin/articles/${result.data.id}`);
      }

      if (currentForm.slug !== result.data.slug) {
        setForm((current) => {
          const next = { ...current, slug: result.data.slug };
          lastSavedSnapshotRef.current = snapshotForm(next);
          return next;
        });
      }

      const linkError = await attachDeferredForumLinks(result.data.id);
      if (linkError) {
        setToast({ message: linkError, variant: "error" });
        return false;
      }

      setToast({ message: "Brouillon enregistré.", variant: "success" });
      if (manual) {
        emitTourSuccess({ target: "article.form.save-draft" });
      }
      return true;
    } finally {
      saveInFlightRef.current = false;
      setIsSaving(false);

      if (pendingAutosaveRef.current) {
        pendingAutosaveRef.current = false;
        void persistDraftRef.current({ manual: false });
      }
    }
  };

  persistDraftRef.current = persistDraft;

  useEffect(() => {
    if (!autosaveReadyRef.current) {
      autosaveReadyRef.current = true;
      lastSavedSnapshotRef.current = snapshotForm(form);
      return;
    }

    if (form.status !== "DRAFT") return;

    const timer = window.setTimeout(() => {
      void persistDraftRef.current({ manual: false });
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [form]);

  const queueLinkedTopicDraft = () => {
    if (!linkedTopicDraftTitle.trim()) {
      setToast({ message: "Le titre de la discussion est requis.", variant: "error" });
      return;
    }

    if (!linkedTopicDraftCategoryId) {
      setToast({ message: "Choisissez une rubrique forum.", variant: "error" });
      return;
    }

    if (isHtmlContentEmpty(linkedTopicDraftBody)) {
      setToast({ message: "Le message initial de la discussion est vide.", variant: "error" });
      return;
    }

    const nextTopic: PendingLinkedTopicDraft = {
      localId: crypto.randomUUID(),
      title: linkedTopicDraftTitle.trim(),
      categoryId: linkedTopicDraftCategoryId,
      body: linkedTopicDraftBody,
    };
    setPendingCreatedTopics((current) => {
      const next = [...current, nextTopic];
      pendingCreatedTopicsRef.current = next;
      return next;
    });
    resetLinkedTopicDraft();
    setToast({ message: "Discussion préparée pour la création du brouillon.", variant: "success" });
    if (currentArticleIdRef.current) {
      void persistDraftRef.current({ manual: true });
    }
  };

  const handlePendingTopicsConfirm = (topicIds: string[]) => {
    pendingLinkedTopicIdsRef.current = topicIds;
    setPendingLinkedTopicIds(topicIds);
    if (currentArticleIdRef.current && topicIds.length > 0) {
      void persistDraftRef.current({ manual: true });
    }
  };

  const removePendingCreatedTopic = (localId: string) => {
    setPendingCreatedTopics((current) => current.filter((topic) => topic.localId !== localId));
  };

  const toggleCategory = (categoryId: string) => {
    setForm((current) => ({
      ...current,
      categoryIds: current.categoryIds.includes(categoryId)
        ? current.categoryIds.filter((id) => id !== categoryId)
        : [...current.categoryIds, categoryId],
    }));
  };

  const handleSaveDraft = async () => {
    await persistDraft({ manual: true });
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
    const result = await publishArticleAction(currentArticleId ?? null, normalizedForm);
    setIsSaving(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    emitTourSuccess({ target: "article.form.publish" });
    const wasAlreadyPublished = form.status === "PUBLISHED";
    setToast({
      message: wasAlreadyPublished ? "Article mis à jour !" : "Article publié !",
      variant: "success",
    });
    if (!currentArticleId) {
      const linkError = await attachDeferredForumLinks(result.data.id);
      if (linkError) {
        setToast({ message: linkError, variant: "error" });
      }
    }
    router.push(`/admin/articles/${result.data.id}`);
    router.refresh();
  };

  const handleArchive = async () => {
    if (!currentArticleId) return;
    if (
      !(await confirm("Archiver cet article ? Il ne sera plus visible sur le site.", {
        variant: "danger",
        confirmLabel: "Archiver",
      }))
    ) {
      return;
    }

    setIsSaving(true);
    const result = await archiveArticleAction(currentArticleId);
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
    if (!currentArticleId) return;

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
    const result = await publishArticleAction(currentArticleId, normalizedForm);
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
    if (!currentArticleId) return;
    if (
      !(await confirm(
        "Supprimer définitivement cet article ? Cette action est irréversible.",
        { variant: "danger", confirmLabel: "Supprimer" },
      ))
    ) {
      return;
    }

    setIsSaving(true);
    const result = await deleteArticleAction(currentArticleId);
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
  const contentWordCount = countEditorWords(form.content);
  const selectedBrowsableTopics = forumLinkOptions
    ? pendingLinkedTopicIds
        .map((topicId) => forumLinkOptions.browsableTopics.find((topic) => topic.id === topicId))
        .filter((topic): topic is AssociableForumTopic => Boolean(topic))
    : [];
  const excerptTone =
    excerptLength === 0
      ? "text-primary/50"
      : excerptLength <= 160
        ? "text-accent-dark"
        : "text-amber-600";
  const actionBar = (
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
            {form.status !== "PUBLISHED" ? (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleSaveDraft}
                className="!px-4 !py-2 text-xs"
                data-tour-id="article.form.save-draft"
              >
                {isSaving ? "Enregistrement…" : "Enregistrer brouillon"}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="accent"
              disabled={isSaving}
              onClick={handlePublish}
              className="!px-4 !py-2 text-xs"
              data-tour-id="article.form.publish"
            >
              {form.status === "PUBLISHED" ? "Mettre à jour" : "Publier"}
            </Button>
            {currentArticleId ? (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={handleArchive}
                className="!px-4 !py-2 text-xs"
                data-tour-id="admin.articles.archive"
              >
                Archiver
              </Button>
            ) : null}
            {currentArticleId && form.status === "PUBLISHED" && form.slug ? (
              <Button
                href={`/a/${form.slug}`}
                external
                variant="outline"
                className="!px-4 !py-2 text-xs"
                data-tour-id="article.public-preview"
              >
                Aperçu public
              </Button>
            ) : null}
          </>
        ) : null}
        {currentArticleId && form.status === "ARCHIVED" ? (
          <>
            <Button
              type="button"
              variant="accent"
              disabled={isSaving}
              onClick={handleRepublish}
              className="!px-4 !py-2 text-xs"
              data-tour-id="admin.articles.republish"
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
  );

  return (
    <div className="space-y-4">
      {actionBar}

      <ComposerPanel
        eyebrow="Publication"
        title={isCreatingNew ? "Nouvel article" : "Édition de l'article"}
        description="Un panneau de rédaction plus guidé pour structurer plus vite le contenu, vérifier la publication et garder les informations importantes sous la main."
        stats={[
          {
            label: "Mots",
            value: `${contentWordCount}`,
            tone: contentWordCount > 0 ? "accent" : "muted",
          },
          {
            label: "Résumé",
            value: `${excerptLength}/160`,
            tone: excerptLength > 0 && excerptLength <= 160 ? "accent" : "default",
          },
          {
            label: "Visuel",
            value: form.coverImageUrl ? "Ajouté" : "Optionnel",
            tone: form.coverImageUrl ? "accent" : "muted",
          },
        ]}
        checklistDescription="Les points ci-dessous reprennent les pré-requis les plus utiles avant publication."
        checklistItems={[
          {
            label: "Titre renseigné",
            done: Boolean(form.title.trim()),
            helper: "Il doit permettre de comprendre le sujet de l'article en un coup d'œil.",
          },
          {
            label: "Contenu principal rédigé",
            done: !isHtmlContentEmpty(form.content),
            helper: "L'article doit contenir un vrai corps de texte, pas seulement un titre ou une image.",
          },
          {
            label: "Résumé de partage prêt",
            done: excerptLength > 0 && excerptLength <= 160,
            helper: "Idéalement entre 120 et 160 caractères pour l'aperçu social.",
          },
          {
            label: "Domaine associé",
            done: form.categoryIds.length > 0,
            helper: "Au moins un domaine est nécessaire pour classer l'article.",
          },
        ]}
        sidebar={
          <div className="rounded-2xl border border-primary/10 bg-bg-soft/35 p-4">
            <h3 className="text-sm font-semibold text-primary-dark">Aide à la rédaction</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-primary/60">
              <li>Commencez par une promesse claire dans le titre et le résumé.</li>
              <li>Structurez le corps avec des intertitres H2/H3 pour faciliter la lecture.</li>
              <li>Associez au moins un domaine avant publication. L&apos;image de couverture est optionnelle.</li>
            </ul>
          </div>
        }
      >
        <div className="min-w-0 space-y-4">
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
              data-tour-id="article.form.title"
            />
            <p className="mt-2 text-xs text-primary/55">
              Affiché en une sur le site, les listes et le partage social.
            </p>
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <FormSection
              title="Domaines"
              description="Au moins un domaine est requis pour publier"
              data-tour-id="article.form.categories"
            >
              {categories.length > 0 ? (
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((category) => (
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
              description="Optionnelle · upload ou bibliothèque libre · 16:9"
              data-tour-id="article.form.cover"
            >
              <ImageUpload
                purpose="cover"
                articleId={currentArticleId}
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
              data-tour-id="article.form.excerpt"
            />
            <p className={cn("mt-1 text-xs", excerptTone)}>
              {excerptLength} / 160 recommandé
              {excerptLength > 160 ? " · trop long pour le partage social" : ""}
            </p>
          </FormSection>

          <section
            className="rounded-lg border border-gray-200 bg-white p-4"
            data-tour-id="article.form.body"
          >
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-primary-dark">Corps de l&apos;article</h3>
              <p className="mt-0.5 text-xs text-primary/60">Rédigez le contenu principal ici</p>
            </div>
            <TipTapEditor
              content={form.content}
              onChange={(html) => updateField("content", html)}
              articleId={currentArticleId}
            />
          </section>

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
            {isCreatingNew ? (
              <button
                type="button"
                className="mt-2 text-xs text-accent-dark hover:underline"
                onClick={() => setSlugLocked(false)}
              >
                Regénérer depuis le titre
              </button>
            ) : null}
          </FormSection>

          {forumLinkOptions ? (
            <FormSection
              title="Discussions forum liées"
              description="Pendant la création, vous pouvez déjà préparer les liaisons. Elles seront appliquées automatiquement au premier enregistrement du brouillon."
              data-tour-id="article.form.forum-links"
            >
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/10 bg-bg-soft/35 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-primary-dark">
                        Associer des sujets existants
                      </p>
                      <p className="mt-1 text-xs text-primary/55">
                        Sélectionnez les discussions déjà publiées à rattacher à cet article.
                      </p>
                    </div>
                    <AssociateForumTopicPicker
                      topics={forumLinkOptions.browsableTopics}
                      selectedIds={pendingLinkedTopicIds}
                      onConfirm={handlePendingTopicsConfirm}
                      triggerClassName="h-10 whitespace-nowrap rounded-lg border border-accent/50 px-3.5 py-0 text-sm font-medium"
                    />
                  </div>
                  <p className="mt-3 text-xs text-primary/55">
                    {pendingLinkedTopicIds.length} sujet{pendingLinkedTopicIds.length > 1 ? "s" : ""} en attente de liaison.
                  </p>
                  {selectedBrowsableTopics.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {selectedBrowsableTopics.map((topic) => (
                        <li
                          key={topic.id}
                          className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-primary-dark">{topic.title}</p>
                            <p className="text-xs text-primary/50">
                              {topic.categoryName}
                              {topic.authorName ? ` · ${topic.authorName}` : ""}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="shrink-0 !rounded-lg !border-red-200 !px-3.5 !py-1.5 text-xs !text-red-600 hover:!bg-red-50 hover:!border-red-300"
                            onClick={() =>
                              setPendingLinkedTopicIds((current) =>
                                current.filter((currentTopicId) => currentTopicId !== topic.id),
                              )
                            }
                          >
                            Retirer
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="rounded-xl border border-primary/10 bg-white p-4">
                  <p className="text-sm font-medium text-primary-dark">Créer une discussion pré-liée</p>
                  <p className="mt-1 text-xs text-primary/55">
                    Pratique si l&apos;article doit sortir avec un fil de discussion dédié.
                  </p>

                  {forumLinkOptions.categories.length === 0 ? (
                    <p className="mt-3 text-sm text-primary/55">
                      Créez d&apos;abord une rubrique forum.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <Input
                        label="Titre de la discussion"
                        value={linkedTopicDraftTitle}
                        onChange={(event) => setLinkedTopicDraftTitle(event.target.value)}
                        placeholder="Ex. Réactions et questions autour de cet article"
                      />
                      <div>
                        <label className="mb-1.5 block text-sm font-medium" htmlFor="linked-topic-category">
                          Rubrique forum
                        </label>
                        <select
                          id="linked-topic-category"
                          value={linkedTopicDraftCategoryId}
                          onChange={(event) => setLinkedTopicDraftCategoryId(event.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                        >
                          {forumLinkOptions.categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <TipTapEditor
                          content={linkedTopicDraftBody}
                          onChange={setLinkedTopicDraftBody}
                          placeholder="Message initial de la discussion..."
                        />
                      </div>
                      <Button type="button" variant="outline" onClick={queueLinkedTopicDraft}>
                        Ajouter à la file d&apos;attente
                      </Button>
                    </div>
                  )}

                  {pendingCreatedTopics.length > 0 ? (
                    <ul className="mt-4 space-y-2">
                      {pendingCreatedTopics.map((topic) => {
                        const categoryName =
                          forumLinkOptions.categories.find((category) => category.id === topic.categoryId)
                            ?.name ?? "Rubrique inconnue";

                        return (
                          <li
                            key={topic.localId}
                            className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-primary-dark">{topic.title}</p>
                              <p className="text-xs text-primary/50">{categoryName}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="shrink-0 !rounded-lg !border-red-200 !px-3.5 !py-1.5 text-xs !text-red-600 hover:!bg-red-50 hover:!border-red-300"
                              onClick={() => removePendingCreatedTopic(topic.localId)}
                            >
                              Retirer
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              </div>
            </FormSection>
          ) : null}

          {forumLinksPanel}

          <FormSection
            title="Lier un document à cet article"
            description="Les PDF se rattachent depuis la bibliothèque Documents, pas depuis ce formulaire."
          >
            <ol className="list-decimal space-y-2 pl-4 text-sm text-primary/75">
              <li>
                Enregistrez d&apos;abord cet article (brouillon ou publication) pour qu&apos;il
                apparaisse dans la liste des associations.
              </li>
              <li>
                Ouvrez{" "}
                <Link
                  href="/admin/documents/nouveau"
                  className="font-medium text-accent-dark hover:underline"
                >
                  Documents → Nouveau document
                </Link>{" "}
                (ou l&apos;édition d&apos;un PDF déjà uploadé).
              </li>
              <li>
                Dans la section <span className="font-medium text-primary-dark">Associations</span>,
                choisissez cet article, puis validez.
              </li>
            </ol>
            <p className="mt-3 text-xs text-primary/55">
              Une fois lié, le document s&apos;affiche sur la page publique de l&apos;article
              (selon sa visibilité).
            </p>
          </FormSection>
        </div>
      </ComposerPanel>

      {actionBar}

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
