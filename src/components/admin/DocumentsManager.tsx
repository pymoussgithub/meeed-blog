"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createDocumentAction,
  deleteDocumentAction,
  linkDocumentToArticleAction,
  toggleDocumentPublicAction,
} from "@/actions/document.actions";
import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { useDialog } from "@/components/ui/DialogProvider";
import { Toast } from "@/components/ui/Toast";

type DocumentRow = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  isPublic: boolean;
  article: { id: string; title: string } | null;
};

type ArticleOption = { id: string; title: string };

type DocumentsManagerProps = {
  documents: DocumentRow[];
  articles: ArticleOption[];
};

export function DocumentsManager({ documents, articles }: DocumentsManagerProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  return (
    <div className="space-y-8">
      <section className="max-w-xl">
        <h2 className="mb-3 text-lg font-semibold">Ajouter un PDF</h2>
        <DocumentUpload
          onUploaded={async (metadata) => {
            const result = await createDocumentAction({
              title: metadata.fileName.replace(/\.pdf$/i, ""),
              fileUrl: metadata.url,
              fileName: metadata.fileName,
              fileSize: metadata.fileSize,
              cloudinaryPublicId: metadata.publicId,
            });

            if (!result.success) {
              setToast({ message: result.error, variant: "error" });
              return;
            }

            setToast({ message: "Document enregistré.", variant: "success" });
            router.refresh();
          }}
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Documents ({documents.length})</h2>
        {documents.length === 0 ? (
          <p className="text-sm text-primary/60">Aucun document uploadé.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Taille</th>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Public</th>
                  <th className="px-4 py-3">Lien</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((document) => (
                  <tr key={document.id}>
                    <td className="px-4 py-3 font-medium">{document.title}</td>
                    <td className="px-4 py-3 text-primary/70">
                      {(document.fileSize / 1024).toFixed(1)} Ko
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={document.article?.id ?? ""}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
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
                      <input
                        type="checkbox"
                        defaultChecked={document.isPublic}
                        onChange={async (event) => {
                          const result = await toggleDocumentPublicAction(
                            document.id,
                            event.target.checked,
                          );
                          if (!result.success) {
                            setToast({ message: result.error, variant: "error" });
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/api/documents/${document.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-dark hover:underline"
                      >
                        Ouvrir
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
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
                ))}
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
