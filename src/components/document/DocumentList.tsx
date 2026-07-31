import type { DocumentVisibility } from "@prisma/client";
import Link from "next/link";
import type { ReactNode } from "react";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";
import {
  getDocumentLinkLabel,
  getDocumentNewsCategories,
  getDocumentProject,
  isDocumentLinked,
  type DocumentWithArticleRelations,
} from "@/lib/documents-listing";
import { cn, formatDate } from "@/lib/utils";

type DocumentItem = {
  id: string;
  title: string;
  description?: string | null;
  fileName: string;
  fileSize: number;
  visibility?: DocumentVisibility;
  createdAt?: Date | string;
  uploadedBy?: { id: string; name: string } | null;
  project?: DocumentWithArticleRelations["project"];
  article?: DocumentWithArticleRelations["article"];
};

type DocumentListProps = {
  documents: DocumentItem[];
  title?: string;
  showRelations?: boolean;
  /** Masque le lien vers l’article (ex. page lecture de cet article). */
  hideArticleLink?: boolean;
};

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(bytes / 1024).toFixed(1)} Ko`;
}

function DocumentActions({ documentId }: { documentId: string }) {
  return (
    <div className="flex shrink-0 flex-col gap-2 lg:self-center">
      <a
        href={`/api/documents/${documentId}/view`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full border border-accent bg-white px-5 py-2.5 text-sm font-semibold text-accent-dark transition-colors hover:bg-accent/5"
        data-tour-id="documents.view"
      >
        Consulter
      </a>
      <a
        href={`/api/documents/${documentId}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
        data-tour-id="documents.download"
      >
        Télécharger
      </a>
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: DocumentVisibility }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        visibility === "PUBLIC"
          ? "bg-accent/10 text-accent-dark"
          : visibility === "CONTRIBUTOR"
            ? "bg-sky-100 text-sky-800"
            : "bg-primary/10 text-primary/65",
      )}
    >
      {getDocumentVisibilityLabel(visibility)}
    </span>
  );
}

function MetaField({
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
      <dd className="mt-0.5 text-primary/80">{children}</dd>
    </div>
  );
}

function DocumentMeta({
  document,
  hideArticleLink = false,
  showLinkBadge = false,
}: {
  document: DocumentItem;
  hideArticleLink?: boolean;
  showLinkBadge?: boolean;
}) {
  const project = getDocumentProject(document);
  const directProject = document.project;
  const categories = getDocumentNewsCategories(document);
  const isLinked = isDocumentLinked(document);
  const linkLabel = getDocumentLinkLabel(document);
  const resolvedProject = directProject ?? project;

  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-semibold text-primary-dark">{document.title}</h3>
        {showLinkBadge ? (
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
              isLinked
                ? "bg-accent/10 text-accent-dark"
                : "bg-gray-100 text-primary/60",
            )}
          >
            {linkLabel}
          </span>
        ) : null}
        {document.visibility ? (
          <VisibilityBadge visibility={document.visibility} />
        ) : null}
      </div>

      {document.description ? (
        <p className="mt-2 break-all text-sm leading-relaxed text-primary/70">
          {document.description}
        </p>
      ) : null}

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {document.article && !hideArticleLink ? (
          <MetaField label="Article">
            <Link
              href={`/a/${document.article.slug}`}
              className="font-medium text-accent-dark hover:text-accent hover:underline"
            >
              {document.article.title}
            </Link>
          </MetaField>
        ) : null}

        {resolvedProject ? (
          <MetaField label="Projet">
            <Link
              href={`/c/${resolvedProject.category.slug}`}
              className="font-medium text-accent-dark hover:text-accent hover:underline"
            >
              {resolvedProject.title}
            </Link>
          </MetaField>
        ) : null}

        {categories.length > 0 ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
              {categories.length > 1 ? "Catégories" : "Catégorie"}
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/c/${category.slug}`}
                  className="inline-flex rounded-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-primary/70 transition-colors hover:bg-accent/10 hover:text-accent-dark"
                >
                  {category.name}
                </Link>
              ))}
            </dd>
          </div>
        ) : null}

        {document.uploadedBy ? (
          <MetaField label="Ajouté par">{document.uploadedBy.name}</MetaField>
        ) : null}

        {document.createdAt ? (
          <MetaField label="Ajouté le">{formatDate(document.createdAt)}</MetaField>
        ) : null}
      </dl>

      <p className="mt-3 text-xs text-primary/40">
        {document.fileName} · {formatFileSize(document.fileSize)} · PDF
      </p>
    </div>
  );
}

export function DocumentList({
  documents,
  title = "Documents associés",
  showRelations = false,
  hideArticleLink = false,
}: DocumentListProps) {
  if (documents.length === 0) {
    return null;
  }

  if (!showRelations) {
    return (
      <section className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="text-lg font-semibold text-primary-dark">{title}</h2>
        <ul className="mt-4 space-y-3">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex flex-col gap-4 rounded-lg bg-white px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <DocumentMeta document={document} hideArticleLink={hideArticleLink} />
              <DocumentActions documentId={document.id} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section>
      {title ? <h2 className="sr-only">{title}</h2> : null}
      <ul className="space-y-4">
        {documents.map((document) => (
          <li
            key={document.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <DocumentMeta
                document={document}
                hideArticleLink={hideArticleLink}
                showLinkBadge
              />
              <DocumentActions documentId={document.id} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
