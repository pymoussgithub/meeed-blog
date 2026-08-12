"use client";

import type { DocumentVisibility } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { setDocumentVisibilityAction } from "@/actions/document.actions";
import { DocumentListActions } from "@/components/admin/DocumentListActions";
import { DocumentStatusBadge } from "@/components/admin/DocumentStatusBadge";
import { Toast } from "@/components/ui/Toast";
import { getDocumentNewsCategories } from "@/lib/documents-listing";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";

type DocumentRow = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  visibility: DocumentVisibility;
  isArchived: boolean;
  article: {
    id: string;
    title: string;
    slug: string;
    categories: Array<{
      category: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type DocumentsManagerProps = {
  documents: DocumentRow[];
};

const VISIBILITY_OPTIONS = ["PUBLIC", "CONTRIBUTOR", "ADMIN"] as const;

export function DocumentsManager({ documents }: DocumentsManagerProps) {
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const tableActionClassName =
    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

  return (
    <div>
      <section data-tour-id="admin.documents.list">
        <h2 className="mb-4 text-lg font-semibold">Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium text-primary-dark">Aucun document uploadé</p>
            <p className="mt-1 text-sm text-primary/60">
              Commencez par ajouter votre premier fichier.
            </p>
            <Link
              href="/admin/documents/nouveau"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              + Nouveau document
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left">
                <tr>
                  <th className="w-[28%] px-3 py-3">Titre</th>
                  <th className="w-[10%] whitespace-nowrap px-2 py-3">Statut</th>
                  <th className="w-[16%] px-2 py-3">Domaine</th>
                  <th className="hidden w-[14%] px-2 py-3 md:table-cell">Article</th>
                  <th className="hidden w-[14%] px-2 py-3 md:table-cell">Visibilité</th>
                  <th className="px-2 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((document) => {
                  const domains = getDocumentNewsCategories(document);

                  return (
                    <tr
                      key={document.id}
                      className={document.isArchived ? "bg-gray-50/80" : undefined}
                    >
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/documents/${document.id}`}
                          className="font-medium break-words text-primary-dark hover:text-accent-dark"
                          title={document.title}
                        >
                          {document.title}
                        </Link>
                        {document.description ? (
                          <p className="mt-0.5 line-clamp-2 break-all text-xs text-primary/60">
                            {document.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3">
                        <DocumentStatusBadge isArchived={document.isArchived} />
                      </td>
                      <td className="px-2 py-3">
                        {domains.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {domains.map((domain) => (
                              <span
                                key={domain.id}
                                className="inline-flex rounded-full bg-bg-soft px-2 py-0.5 text-xs font-medium text-primary/70"
                              >
                                {domain.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-primary/40">—</span>
                        )}
                      </td>
                      <td className="hidden max-w-0 px-2 py-3 md:table-cell">
                        {document.article ? (
                          <Link
                            href={`/admin/articles/${document.article.id}`}
                            className="line-clamp-3 text-xs font-medium text-accent-dark hover:underline"
                            title={document.article.title}
                          >
                            {document.article.title}
                          </Link>
                        ) : (
                          <span className="text-primary/40">—</span>
                        )}
                      </td>
                      <td className="hidden px-2 py-3 md:table-cell">
                        <select
                          defaultValue={document.visibility}
                          disabled={document.isArchived}
                          className="w-full max-w-full truncate rounded border border-gray-300 px-1.5 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-100"
                          data-tour-id="admin.documents.visibility"
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
                      <td className="px-2 py-3">
                        <div className="flex flex-col items-end gap-1.5 md:items-stretch md:gap-2">
                          <Link
                            href={`/admin/documents/${document.id}`}
                            className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                          >
                            Éditer
                          </Link>
                          {!document.isArchived ? (
                            <a
                              href={`/api/documents/${document.id}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                            >
                              Voir
                            </a>
                          ) : null}
                          <DocumentListActions
                            documentId={document.id}
                            documentTitle={document.title}
                            isArchived={document.isArchived}
                            className={tableActionClassName}
                          />
                        </div>
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
