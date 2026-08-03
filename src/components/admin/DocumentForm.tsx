"use client";

import type { DocumentVisibility } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateDocumentAction } from "@/actions/document.actions";
import { DocumentListActions } from "@/components/admin/DocumentListActions";
import { DocumentStatusBadge } from "@/components/admin/DocumentStatusBadge";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";
import {
  DOCUMENT_DESCRIPTION_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/lib/validations/document";

type ArticleOption = { id: string; title: string; projectId: string | null };
type ProjectOption = { id: string; title: string };

type DocumentFormProps = {
  documentId: string;
  articles: ArticleOption[];
  projects: ProjectOption[];
  initialData: {
    title: string;
    description: string | null;
    visibility: DocumentVisibility;
    isArchived: boolean;
    fileName: string;
    fileSize: number;
    articleId: string | null;
    projectId: string | null;
  };
};

const VISIBILITY_OPTIONS = ["PUBLIC", "CONTRIBUTOR", "ADMIN"] as const;

const fieldClassName =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

const tableActionClassName =
  "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export function DocumentForm({
  documentId,
  articles,
  projects,
  initialData,
}: DocumentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [visibility, setVisibility] = useState<DocumentVisibility>(initialData.visibility);
  const [articleId, setArticleId] = useState(initialData.articleId ?? "");
  const [projectId, setProjectId] = useState(initialData.projectId ?? "");
  const [fileMeta, setFileMeta] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    cloudinaryPublicId: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  const linkedArticle = articles.find((article) => article.id === articleId);
  const linkedToArticle = Boolean(linkedArticle);
  const displayProjectId = linkedArticle?.projectId ?? projectId;

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateDocumentAction(documentId, {
        title: title.trim(),
        description: description.trim() || null,
        visibility,
        articleId: articleId || null,
        projectId: linkedToArticle ? null : projectId || null,
        ...(fileMeta ?? {}),
      });

      if (!result.success) {
        setToast({ message: result.error, variant: "error" });
        return;
      }

      setToast({ message: "Document mis à jour.", variant: "success" });
      setFileMeta(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DocumentStatusBadge isArchived={initialData.isArchived} />
        <div className="flex flex-wrap items-center gap-2">
          {!initialData.isArchived ? (
            <a
              href={`/api/documents/${documentId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
            >
              Voir
            </a>
          ) : null}
          <DocumentListActions
            documentId={documentId}
            documentTitle={initialData.title}
            isArchived={initialData.isArchived}
            className={tableActionClassName}
          />
        </div>
      </div>

      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-primary-dark">Informations</h3>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Titre</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={DOCUMENT_TITLE_MAX_LENGTH}
            required
            className={fieldClassName}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">
            Descriptif <span className="font-normal text-primary/50">(optionnel)</span>
          </span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={DOCUMENT_DESCRIPTION_MAX_LENGTH}
            rows={3}
            className={fieldClassName}
          />
          <span className="mt-1 block text-xs text-primary/45">
            {description.length}/{DOCUMENT_DESCRIPTION_MAX_LENGTH}
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Visibilité</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as DocumentVisibility)}
            className={fieldClassName}
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getDocumentVisibilityLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-primary-dark">Associations</h3>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Article</span>
          <select
            value={articleId}
            onChange={(event) => {
              const nextArticleId = event.target.value;
              setArticleId(nextArticleId);
              const article = articles.find((item) => item.id === nextArticleId);
              if (article?.projectId) {
                setProjectId(article.projectId);
              }
            }}
            className={fieldClassName}
          >
            <option value="">Aucun</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Projet</span>
          <select
            value={displayProjectId}
            disabled={linkedToArticle}
            title={linkedToArticle ? "Projet hérité de l’article lié" : undefined}
            onChange={(event) => setProjectId(event.target.value)}
            className={`${fieldClassName} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-primary/60`}
          >
            <option value="">Aucun</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-primary-dark">Fichier</h3>
        <p className="text-sm text-primary/60">
          Fichier actuel :{" "}
          <span className="font-medium text-primary-dark">
            {fileMeta?.fileName ?? initialData.fileName}
          </span>{" "}
          ({((fileMeta?.fileSize ?? initialData.fileSize) / 1024).toFixed(1)} Ko)
        </p>
        <DocumentUpload
          confirmBeforeUpload
          submitLabel="Remplacer le fichier"
          onUploaded={(metadata) => {
            setFileMeta({
              fileUrl: metadata.url,
              fileName: metadata.fileName,
              fileSize: metadata.fileSize,
              mimeType: metadata.mimeType,
              cloudinaryPublicId: metadata.publicId,
            });
            setToast({
              message: "Nouveau fichier prêt. Enregistrez pour appliquer.",
              variant: "success",
            });
          }}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="accent" disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Link
          href="/admin/documents"
          className="text-sm font-medium text-primary/60 hover:text-accent-dark"
        >
          Retour à la liste
        </Link>
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
