"use client";

import Link from "next/link";
import { useState } from "react";
import { Toast } from "@/components/ui/Toast";
import {
  getDocumentLinkLabel,
  getDocumentProject,
  isDocumentLinked,
  type DocumentWithArticleRelations,
} from "@/lib/documents-listing";
import { cn, formatDate } from "@/lib/utils";

type DocumentRow = {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  fileSize: number;
  createdAt?: Date | string;
  uploadedBy?: { id: string; name: string } | null;
  project?: DocumentWithArticleRelations["project"];
  article?: DocumentWithArticleRelations["article"];
};

type DocumentsTableProps = {
  documents: DocumentRow[];
  emptyMessage?: string;
};

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(bytes / 1024).toFixed(1)} Ko`;
}

const actionButtonClassName =
  "inline-flex items-center justify-center rounded-lg border border-primary/15 bg-white px-2.5 py-1.5 text-xs font-semibold text-primary shadow-sm transition-colors hover:border-accent/50 hover:bg-bg-soft/60 hover:text-accent-dark";

const primaryActionClassName =
  "inline-flex items-center justify-center rounded-lg bg-accent px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-accent/20 transition-colors hover:bg-accent-dark";

function DocumentRowActions({ documentId }: { documentId: string }) {
  const [toast, setToast] = useState<string | null>(null);
  const viewPath = `/api/documents/${documentId}/view`;
  const downloadPath = `/api/documents/${documentId}/download`;

  async function copyLink() {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}${viewPath}`
          : viewPath;
      await navigator.clipboard.writeText(url);
      setToast("Lien copié !");
    } catch {
      setToast("Impossible de copier le lien");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <a
          href={viewPath}
          target="_blank"
          rel="noopener noreferrer"
          className={actionButtonClassName}
          data-tour-id="documents.view"
        >
          Consulter
        </a>
        <a
          href={downloadPath}
          target="_blank"
          rel="noopener noreferrer"
          className={primaryActionClassName}
          data-tour-id="documents.download"
        >
          Télécharger
        </a>
        <button type="button" onClick={copyLink} className={actionButtonClassName}>
          Copier le lien
        </button>
      </div>
      <Toast
        message={toast ?? ""}
        visible={Boolean(toast)}
        variant={toast?.includes("Impossible") ? "error" : "success"}
        onClose={() => setToast(null)}
      />
    </>
  );
}

function DocumentRowItem({ document }: { document: DocumentRow }) {
  const project = getDocumentProject(document);
  const isLinked = isDocumentLinked(document);
  const linkLabel = getDocumentLinkLabel(document);

  return (
    <tr className="transition-colors hover:bg-bg-soft/40">
      <td className="min-w-0 max-w-[18rem] px-4 py-3 text-left align-middle sm:max-w-sm md:max-w-md lg:max-w-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-base font-semibold break-words text-primary-dark">
            {document.title}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
              isLinked ? "bg-accent/10 text-accent-dark" : "bg-gray-100 text-primary/60",
            )}
          >
            {linkLabel}
          </span>
        </div>
        {document.description ? (
          <p className="mt-1 line-clamp-2 break-all text-xs text-primary/55 sm:text-sm">
            {document.description}
          </p>
        ) : null}
        <p className="mt-1.5 text-xs text-primary/40">
          {document.fileName} · {formatFileSize(document.fileSize)} · PDF
        </p>

        <div className="mt-2 space-y-1 text-xs text-primary/55 lg:hidden">
          {document.article ? (
            <p className="md:hidden">
              Article :{" "}
              <Link
                href={`/a/${document.article.slug}`}
                className="font-medium text-accent-dark hover:underline"
              >
                {document.article.title}
              </Link>
            </p>
          ) : null}
          {project ? (
            <p className="sm:hidden">
              Projet :{" "}
              <Link
                href={`/c/${project.category.slug}`}
                className="font-medium text-accent-dark hover:underline"
              >
                {project.title}
              </Link>
            </p>
          ) : null}
          {document.uploadedBy ? (
            <p className="sm:hidden">Par {document.uploadedBy.name}</p>
          ) : null}
          {document.createdAt ? (
            <p className="md:hidden">{formatDate(document.createdAt)}</p>
          ) : null}
          <div className="pt-1">
            <DocumentRowActions documentId={document.id} />
          </div>
        </div>
      </td>

      <td className="hidden px-3 py-3 text-center align-middle md:table-cell">
        {document.article ? (
          <Link
            href={`/a/${document.article.slug}`}
            className="line-clamp-2 font-medium text-accent-dark hover:underline"
          >
            {document.article.title}
          </Link>
        ) : (
          <span className="text-primary/40">—</span>
        )}
      </td>

      <td className="hidden px-3 py-3 text-center align-middle sm:table-cell">
        {project ? (
          <Link
            href={`/c/${project.category.slug}`}
            className="line-clamp-2 font-medium text-accent-dark hover:underline"
          >
            {project.title}
          </Link>
        ) : (
          <span className="text-primary/40">—</span>
        )}
      </td>

      <td className="hidden whitespace-nowrap px-3 py-3 text-center align-middle text-primary/65 sm:table-cell">
        {document.uploadedBy?.name ?? <span className="text-primary/40">—</span>}
      </td>

      <td className="hidden whitespace-nowrap px-3 py-3 text-center align-middle text-primary/65 md:table-cell">
        {document.createdAt ? formatDate(document.createdAt) : (
          <span className="text-primary/40">—</span>
        )}
      </td>

      <td className="hidden px-3 py-3 text-right align-middle lg:table-cell">
        <DocumentRowActions documentId={document.id} />
      </td>
    </tr>
  );
}

export function DocumentsTable({
  documents,
  emptyMessage = "Aucun document pour le moment.",
}: DocumentsTableProps) {
  if (documents.length === 0) {
    return <p className="text-center text-primary/60">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-primary/10 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-primary/10 bg-bg-soft/60 text-primary/70">
          <tr>
            <th className="min-w-[14rem] px-4 py-2.5 text-left font-heading font-semibold text-primary-dark">
              Document
            </th>
            <th className="hidden min-w-[8rem] px-3 py-2.5 text-center font-heading font-semibold text-primary-dark md:table-cell">
              Article lié
            </th>
            <th className="hidden min-w-[7rem] px-3 py-2.5 text-center font-heading font-semibold text-primary-dark sm:table-cell">
              Projet
            </th>
            <th className="hidden whitespace-nowrap px-3 py-2.5 text-center font-heading font-semibold text-primary-dark sm:table-cell">
              Contributeur
            </th>
            <th className="hidden whitespace-nowrap px-3 py-2.5 text-center font-heading font-semibold text-primary-dark md:table-cell">
              Date
            </th>
            <th className="hidden whitespace-nowrap px-3 py-2.5 text-right font-heading font-semibold text-primary-dark lg:table-cell">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {documents.map((document) => (
            <DocumentRowItem key={document.id} document={document} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
