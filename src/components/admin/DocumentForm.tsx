"use client";

import type { DocumentVisibility } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateDocumentAction } from "@/actions/document.actions";
import {
  DocumentArticlePicker,
  type DocumentAssociableArticle,
  type DocumentAssociableCategory,
} from "@/components/admin/DocumentArticlePicker";
import { DocumentDomainPicker } from "@/components/admin/DocumentDomainPicker";
import { DocumentListActions } from "@/components/admin/DocumentListActions";
import { DocumentStatusBadge } from "@/components/admin/DocumentStatusBadge";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";
import { DOCUMENT_TITLE_MAX_LENGTH } from "@/lib/validations/document";

type DocumentFormProps = {
  documentId: string;
  articles: DocumentAssociableArticle[];
  categories: DocumentAssociableCategory[];
  initialData: {
    title: string;
    description: string | null;
    visibility: DocumentVisibility;
    isArchived: boolean;
    fileName: string;
    fileSize: number;
    articleId: string | null;
    categoryId: string | null;
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
  categories,
  initialData,
}: DocumentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [visibility, setVisibility] = useState<DocumentVisibility>(initialData.visibility);
  const [articleId, setArticleId] = useState(initialData.articleId ?? "");
  const [categoryId, setCategoryId] = useState(initialData.categoryId ?? "");
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateDocumentAction(documentId, {
        title: title.trim(),
        description: description.trim() || null,
        visibility,
        articleId: articleId || null,
        categoryId: categoryId || null,
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
          <Button
            type="button"
            variant="accent"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-full px-3 py-1.5 text-xs"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
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
            rows={4}
            className={fieldClassName}
          />
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

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-primary-dark">Associations</h3>
        <DocumentArticlePicker
          articles={articles}
          categories={categories}
          value={articleId}
          onChange={setArticleId}
        />
        <DocumentDomainPicker
          categories={categories}
          value={categoryId}
          onChange={setCategoryId}
        />
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
        <Button href="/admin/documents" variant="outline" className="gap-2">
          <span aria-hidden="true">←</span>
          Retour aux documents
        </Button>
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
