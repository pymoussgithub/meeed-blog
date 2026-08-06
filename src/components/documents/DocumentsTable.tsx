"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import {
  getDocumentLinkLabel,
  getDocumentNewsCategories,
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
  article?: DocumentWithArticleRelations["article"];
  category?: DocumentWithArticleRelations["category"];
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
      <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
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

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-primary/80">{children}</dd>
    </div>
  );
}

function DocumentDescriptionModal({
  document,
  open,
  onClose,
}: {
  document: DocumentRow;
  open: boolean;
  onClose: () => void;
}) {
  const categories = getDocumentNewsCategories(document);
  const isLinked = isDocumentLinked(document);
  const linkLabel = getDocumentLinkLabel(document);

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="flex max-h-[min(90dvh,36rem)] max-w-lg flex-col overflow-hidden rounded-3xl p-0"
    >
      <h2
        id="modal-title"
        className="shrink-0 px-6 pb-2 pr-14 pt-6 text-lg font-bold text-primary-dark"
      >
        {document.title}
      </h2>
      <div className="scrollbar-meeed min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 pb-6 pt-1">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
            isLinked ? "bg-accent/10 text-accent-dark" : "bg-gray-100 text-primary/60",
          )}
        >
          {linkLabel}
        </span>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/45">
            Description
          </h3>
          {document.description ? (
            <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-primary/75">
              {document.description}
            </p>
          ) : (
            <p className="mt-1.5 text-sm italic text-primary/45">
              Aucune description pour ce document.
            </p>
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Fichier">
            <span className="break-all">{document.fileName}</span>
          </DetailField>
          <DetailField label="Taille">{formatFileSize(document.fileSize)}</DetailField>
          <DetailField label="Format">PDF</DetailField>
          {document.createdAt ? (
            <DetailField label="Ajouté le">{formatDate(document.createdAt)}</DetailField>
          ) : null}
          {document.uploadedBy ? (
            <DetailField label="Contributeur">{document.uploadedBy.name}</DetailField>
          ) : null}
          {document.article ? (
            <DetailField label="Article lié">
              <Link
                href={`/a/${document.article.slug}`}
                className="font-medium text-accent-dark hover:underline"
                onClick={onClose}
              >
                {document.article.title}
              </Link>
            </DetailField>
          ) : null}
          {categories.length > 0 ? (
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                {categories.length > 1 ? "Domaines" : "Domaine"}
              </dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/c/${category.slug}`}
                    className="inline-flex rounded-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-primary/70 transition-colors hover:bg-accent/10 hover:text-accent-dark"
                    onClick={onClose}
                  >
                    {category.name}
                  </Link>
                ))}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="flex flex-wrap gap-2 border-t border-primary/10 pt-4">
          <a
            href={`/api/documents/${document.id}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className={actionButtonClassName}
          >
            Consulter
          </a>
          <a
            href={`/api/documents/${document.id}/download`}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryActionClassName}
          >
            Télécharger
          </a>
        </div>
      </div>
    </Modal>
  );
}

function DocumentDomainsCell({ document }: { document: DocumentRow }) {
  const domains = getDocumentNewsCategories(document);

  if (domains.length === 0) {
    return <span className="text-primary/40">—</span>;
  }

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {domains.map((domain) => (
        <Link
          key={domain.id}
          href={`/c/${domain.slug}`}
          className="inline-flex rounded-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-primary/70 transition-colors hover:bg-accent/10 hover:text-accent-dark"
        >
          {domain.name}
        </Link>
      ))}
    </div>
  );
}

function DocumentRowItem({ document }: { document: DocumentRow }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const isLinked = isDocumentLinked(document);
  const linkLabel = getDocumentLinkLabel(document);
  const domains = getDocumentNewsCategories(document);

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
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className={cn(actionButtonClassName, "mt-2")}
        >
          Description du document
        </button>
        <p className="mt-1.5 text-xs text-primary/40">
          {document.fileName} · {formatFileSize(document.fileSize)} · PDF
        </p>

        <div className="mt-2 space-y-1 text-xs text-primary/55 lg:hidden">
          {domains.length > 0 ? (
            <p className="md:hidden">
              Domaine{domains.length > 1 ? "s" : ""} :{" "}
              {domains.map((domain, index) => (
                <span key={domain.id}>
                  {index > 0 ? ", " : null}
                  <Link
                    href={`/c/${domain.slug}`}
                    className="font-medium text-accent-dark hover:underline"
                  >
                    {domain.name}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
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

        <DocumentDescriptionModal
          document={document}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
        />
      </td>

      <td className="hidden px-3 py-3 text-center align-middle md:table-cell">
        <DocumentDomainsCell document={document} />
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
            <th className="hidden min-w-[7rem] px-3 py-2.5 text-center font-heading font-semibold text-primary-dark md:table-cell">
              Domaine
            </th>
            <th className="hidden min-w-[8rem] px-3 py-2.5 text-center font-heading font-semibold text-primary-dark md:table-cell">
              Article lié
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
