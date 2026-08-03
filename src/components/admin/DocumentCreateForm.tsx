"use client";

import type { DocumentVisibility } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createDocumentAction } from "@/actions/document.actions";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { Toast } from "@/components/ui/Toast";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";
import { emitTourSuccess } from "@/lib/tour/validation";
import {
  DOCUMENT_DESCRIPTION_MAX_LENGTH,
  DOCUMENT_TITLE_MAX_LENGTH,
} from "@/lib/validations/document";

type ArticleOption = { id: string; title: string; projectId: string | null };
type ProjectOption = { id: string; title: string };

type DocumentCreateFormProps = {
  articles: ArticleOption[];
  projects: ProjectOption[];
};

const VISIBILITY_OPTIONS = ["PUBLIC", "CONTRIBUTOR", "ADMIN"] as const;

const fieldClassName =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function DocumentCreateForm({ articles, projects }: DocumentCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility>("PUBLIC");
  const [articleId, setArticleId] = useState("");
  const [projectId, setProjectId] = useState("");
  const metaRef = useRef({
    title: "",
    description: "",
    visibility: "PUBLIC" as DocumentVisibility,
    articleId: "",
    projectId: "",
  });
  metaRef.current = { title, description, visibility, articleId, projectId };
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  const linkedArticle = articles.find((article) => article.id === articleId);
  const linkedToArticle = Boolean(linkedArticle);
  const displayProjectId = linkedArticle?.projectId ?? projectId;

  return (
    <div className="mx-auto max-w-2xl space-y-6" data-tour-id="admin.documents.upload">
      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-primary-dark">Informations</h3>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Titre</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Court descriptif du document"
            maxLength={DOCUMENT_DESCRIPTION_MAX_LENGTH}
            rows={3}
            className={fieldClassName}
          />
          <span className="mt-1 block text-xs text-primary/45">
            {description.length}/{DOCUMENT_DESCRIPTION_MAX_LENGTH} — affiché sur 2 lignes max dans
            la bibliothèque
          </span>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-primary-dark">Visibilité</span>
          <select
            value={visibility}
            onChange={(event) => setVisibility(event.target.value as DocumentVisibility)}
            className={fieldClassName}
            data-tour-id="admin.documents.visibility"
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
        <p className="text-xs text-primary/50">Optionnel — vous pourrez aussi les modifier plus tard.</p>
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
        <p className="text-xs text-primary/50">
          Tout type de fichier accepté, 25 Mo maximum. Sélectionnez le fichier puis validez.
        </p>
        <DocumentUpload
          confirmBeforeUpload
          submitLabel="Valider et enregistrer le document"
          validateBeforeUpload={() => {
            if (metaRef.current.title.trim().length < 2) {
              return "Indiquez un titre d’au moins 2 caractères avant de valider.";
            }
            if (
              metaRef.current.description.trim().length > DOCUMENT_DESCRIPTION_MAX_LENGTH
            ) {
              return `Le descriptif ne peut pas dépasser ${DOCUMENT_DESCRIPTION_MAX_LENGTH} caractères.`;
            }
            return true;
          }}
          onUploaded={async (metadata) => {
            const meta = metaRef.current;
            const trimmedTitle = meta.title.trim();
            const trimmedDescription = meta.description.trim();
            const linked = articles.find((article) => article.id === meta.articleId);

            const result = await createDocumentAction({
              title: trimmedTitle,
              description: trimmedDescription || undefined,
              fileUrl: metadata.url,
              fileName: metadata.fileName,
              fileSize: metadata.fileSize,
              mimeType: metadata.mimeType,
              cloudinaryPublicId: metadata.publicId,
              visibility: meta.visibility,
              articleId: meta.articleId || null,
              projectId: linked?.projectId ?? (meta.projectId || null),
            });

            if (!result.success) {
              setToast({ message: result.error, variant: "error" });
              return;
            }

            emitTourSuccess({ target: "admin.documents.upload" });
            setToast({ message: "Document enregistré.", variant: "success" });
            router.push("/admin/documents");
            router.refresh();
          }}
        />
      </section>

      <Link
        href="/admin/documents"
        className="inline-block text-sm font-medium text-primary/60 hover:text-accent-dark"
      >
        Retour à la liste
      </Link>

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
