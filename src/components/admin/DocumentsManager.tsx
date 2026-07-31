"use client";

import type { DocumentVisibility } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  createDocumentAction,
  deleteDocumentAction,
  linkDocumentToArticleAction,
  linkDocumentToProjectAction,
  setDocumentVisibilityAction,
} from "@/actions/document.actions";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { useDialog } from "@/components/ui/DialogProvider";
import { Toast } from "@/components/ui/Toast";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";
import { emitTourSuccess } from "@/lib/tour/validation";
import {
  DOCUMENT_DESCRIPTION_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/lib/validations/document";

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  visibility: DocumentVisibility;
  article: {
    id: string;
    title: string;
    projectId: string | null;
    project: { id: string; title: string } | null;
  } | null;
  project: { id: string; title: string } | null;
};

type ArticleOption = { id: string; title: string };
type ProjectOption = { id: string; title: string };

type DocumentsManagerProps = {
  documents: DocumentRow[];
  articles: ArticleOption[];
  projects: ProjectOption[];
};

const VISIBILITY_OPTIONS = [
  "PUBLIC",
  "CONTRIBUTOR",
  "ADMIN",
] as const;

export function DocumentsManager({ documents, articles, projects }: DocumentsManagerProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadVisibility, setUploadVisibility] = useState<DocumentVisibility>("PUBLIC");
  const uploadMetaRef = useRef({ title: "", description: "", visibility: "PUBLIC" as DocumentVisibility });
  uploadMetaRef.current = {
    title: uploadTitle,
    description: uploadDescription,
    visibility: uploadVisibility,
  };
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const tableActionClassName =
    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
  const fieldClassName =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

  return (
    <div className="space-y-8">
      <section className="max-w-xl" data-tour-id="admin.documents.upload">
        <h2 className="mb-3 text-lg font-semibold">Ajouter un PDF</h2>
        <div className="mb-3 space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-primary-dark">Titre</span>
            <input
              type="text"
              value={uploadTitle}
              onChange={(event) => setUploadTitle(event.target.value)}
              placeholder="Titre du document"
              maxLength={DOCUMENT_TITLE_MAX_LENGTH}
              required
              className={fieldClassName}
              data-tour-id="admin.documents.title"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-primary-dark">
              Descriptif <span className="font-normal text-primary/50">(optionnel)</span>
            </span>
            <textarea
              value={uploadDescription}
              onChange={(event) => setUploadDescription(event.target.value)}
              placeholder="Court descriptif du document"
              maxLength={DOCUMENT_DESCRIPTION_MAX_LENGTH}
              rows={3}
              className={fieldClassName}
            />
            <span className="mt-1 block text-xs text-primary/45">
              {uploadDescription.length}/{DOCUMENT_DESCRIPTION_MAX_LENGTH} — affiché sur 2 lignes
              max dans la bibliothèque
            </span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-primary-dark">Visibilité du document</span>
            <select
              value={uploadVisibility}
              onChange={(event) => setUploadVisibility(event.target.value as DocumentVisibility)}
              className={fieldClassName}
              data-tour-id="admin.documents.visibility"
            >
              {VISIBILITY_OPTIONS.map((visibility) => (
                <option key={visibility} value={visibility}>
                  {getDocumentVisibilityLabel(visibility)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <DocumentUpload
          confirmBeforeUpload
          submitLabel="Valider et enregistrer le document"
          validateBeforeUpload={() => {
            if (uploadMetaRef.current.title.trim().length < 2) {
              return "Indiquez un titre d’au moins 2 caractères avant de valider.";
            }
            if (
              uploadMetaRef.current.description.trim().length > DOCUMENT_DESCRIPTION_MAX_LENGTH
            ) {
              return `Le descriptif ne peut pas dépasser ${DOCUMENT_DESCRIPTION_MAX_LENGTH} caractères.`;
            }
            return true;
          }}
          onUploaded={async (metadata) => {
            const { title, description, visibility } = uploadMetaRef.current;
            const trimmedTitle = title.trim();
            const trimmedDescription = description.trim();

            const result = await createDocumentAction({
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              fileUrl: metadata.url,
              fileName: metadata.fileName,
              fileSize: metadata.fileSize,
              mimeType: metadata.mimeType,
              cloudinaryPublicId: metadata.publicId,
              visibility,
            });

            if (!result.success) {
              setToast({ message: result.error, variant: "error" });
              return;
            }

            setUploadTitle("");
            setUploadDescription("");
            setUploadVisibility("PUBLIC");
            emitTourSuccess({ target: "admin.documents.upload" });
            setToast({ message: "Document enregistré.", variant: "success" });
            router.refresh();
          }}
        />
      </section>

      <section data-tour-id="admin.documents.list">
        <h2 className="mb-4 text-lg font-semibold">Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-primary/60">Aucun document uploadé.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-max min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="whitespace-nowrap px-4 py-3">Taille</th>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Projet</th>
                  <th className="px-4 py-3">Visibilité</th>
                  <th className="px-4 py-3">Lien</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((document) => {
                  const linkedToArticle = Boolean(document.article);
                  const effectiveProjectId =
                    document.article?.project?.id ??
                    document.article?.projectId ??
                    document.project?.id ??
                    "";

                  return (
                  <tr key={document.id}>
                    <td className="max-w-[14rem] px-4 py-3">
                      <p className="font-medium break-words" title={document.title}>
                        {document.title}
                      </p>
                      {document.description ? (
                        <p className="mt-0.5 line-clamp-2 break-all text-xs text-primary/60">
                          {document.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-primary/70">
                      {(document.fileSize / 1024).toFixed(1)} Ko
                    </td>
                    <td className="px-4 py-3">
                      <select
                        key={`article-${document.id}-${document.article?.id ?? ""}`}
                        defaultValue={document.article?.id ?? ""}
                        className="w-36 max-w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        onChange={async (event) => {
                          const result = await linkDocumentToArticleAction(
                            document.id,
                            event.target.value || null,
                          );
                          if (!result.success) {
                            setToast({ message: result.error, variant: "error" });
                            return;
                          }
                          router.refresh();
                        }}
                      >
                        <option value="">Aucun</option>
                        {articles.map((article) => (
                          <option key={article.id} value={article.id}>
                            {article.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        key={`project-${document.id}-${effectiveProjectId}-${linkedToArticle}`}
                        defaultValue={effectiveProjectId}
                        disabled={linkedToArticle}
                        title={
                          linkedToArticle
                            ? "Projet hérité de l’article lié"
                            : undefined
                        }
                        className="w-36 max-w-full rounded border border-gray-300 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-primary/60"
                        onChange={async (event) => {
                          const result = await linkDocumentToProjectAction(
                            document.id,
                            event.target.value || null,
                          );
                          if (!result.success) {
                            setToast({ message: result.error, variant: "error" });
                            return;
                          }
                          router.refresh();
                        }}
                      >
                        <option value="">Aucun</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={document.visibility}
                        className="w-40 max-w-full rounded border border-gray-300 px-2 py-1 text-xs"
                        onChange={async (event) => {
                          const result = await setDocumentVisibilityAction(
                            document.id,
                            event.target.value as DocumentVisibility,
                          );
                          if (!result.success) {
                            setToast({ message: result.error, variant: "error" });
                          }
                        }}
                      >
                        {VISIBILITY_OPTIONS.map((visibility) => (
                          <option key={visibility} value={visibility}>
                            {getDocumentVisibilityLabel(visibility)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a
                        href={`/api/documents/${document.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                      >
                        Ouvrir
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        type="button"
                        className={`${tableActionClassName} shrink-0 border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        onClick={async () => {
                          if (
                            !(await confirm(
                              `Supprimer définitivement « ${document.title} » ? Cette action est irréversible.`,
                              { variant: "danger", confirmLabel: "Supprimer" },
                            ))
                          ) {
                            return;
                          }

                          const result = await deleteDocumentAction(document.id);
                          if (!result.success) {
                            setToast({ message: result.error, variant: "error" });
                            return;
                          }

                          setToast({ message: "Document supprimé.", variant: "success" });
                          router.refresh();
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
