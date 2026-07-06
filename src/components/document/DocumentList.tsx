import Link from "next/link";
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
  createdAt?: Date | string;
  uploadedBy?: { id: string; name: string } | null;
  project?: DocumentWithArticleRelations["project"];
  article?: DocumentWithArticleRelations["article"];
};

type DocumentListProps = {
  documents: DocumentItem[];
  title?: string;
  showRelations?: boolean;
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
      >
        Consulter
      </a>
      <a
        href={`/api/documents/${documentId}/download`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
      >
        Télécharger
      </a>
    </div>
  );
}

export function DocumentList({
  documents,
  title = "Documents associés",
  showRelations = false,
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-primary-dark">{document.title}</p>
                {document.description ? (
                  <p className="mt-1 text-sm text-primary/60">{document.description}</p>
                ) : null}
                <p className="mt-1 text-xs text-primary/40">
                  {formatFileSize(document.fileSize)} · PDF
                </p>
              </div>
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
        {documents.map((document) => {
          const project = getDocumentProject(document);
          const directProject = document.project;
          const categories = getDocumentNewsCategories(document);
          const isLinked = isDocumentLinked(document);
          const linkLabel = getDocumentLinkLabel(document);

          return (
            <li
              key={document.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary-dark">{document.title}</h3>
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
                  </div>

                  {document.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-primary/70">
                      {document.description}
                    </p>
                  ) : null}

                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    {document.article ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                          Article
                        </dt>
                        <dd className="mt-0.5">
                          <Link
                            href={`/a/${document.article.slug}`}
                            className="font-medium text-accent-dark hover:text-accent hover:underline"
                          >
                            {document.article.title}
                          </Link>
                        </dd>
                      </div>
                    ) : null}

                    {directProject ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                          Projet
                        </dt>
                        <dd className="mt-0.5">
                          <Link
                            href={`/c/${directProject.slug}`}
                            className="font-medium text-accent-dark hover:text-accent hover:underline"
                          >
                            {directProject.title}
                          </Link>
                        </dd>
                      </div>
                    ) : project && !directProject ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                          Projet
                        </dt>
                        <dd className="mt-0.5">
                          <Link
                            href={`/c/${project.slug}`}
                            className="font-medium text-accent-dark hover:text-accent hover:underline"
                          >
                            {project.title}
                          </Link>
                        </dd>
                      </div>
                    ) : null}

                    {categories.length > 0 ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                          {categories.length > 1 ? "Catégories" : "Catégorie"}
                        </dt>
                        <dd className="mt-1 flex flex-wrap gap-1.5">
                          {categories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex rounded-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-primary/70"
                            >
                              {category.name}
                            </span>
                          ))}
                        </dd>
                      </div>
                    ) : null}

                    {document.uploadedBy ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                          Contributeur
                        </dt>
                        <dd className="mt-0.5 text-primary/80">{document.uploadedBy.name}</dd>
                      </div>
                    ) : null}

                    {document.createdAt ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-primary/45">
                          Ajouté le
                        </dt>
                        <dd className="mt-0.5 text-primary/80">
                          {formatDate(document.createdAt)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>

                  <p className="mt-3 text-xs text-primary/40">
                    {document.fileName} · {formatFileSize(document.fileSize)} · PDF
                  </p>
                </div>

                <DocumentActions documentId={document.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
