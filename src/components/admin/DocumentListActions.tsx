"use client";

import { useRouter } from "next/navigation";
import {
  archiveDocumentAction,
  deleteDocumentAction,
  restoreDocumentAction,
} from "@/actions/document.actions";
import { useDialog } from "@/components/ui/DialogProvider";

type DocumentListActionsProps = {
  documentId: string;
  documentTitle: string;
  isArchived: boolean;
  className?: string;
};

export function DocumentListActions({
  documentId,
  documentTitle,
  isArchived,
  className = "",
}: DocumentListActionsProps) {
  const router = useRouter();
  const { confirm, alert } = useDialog();

  if (isArchived) {
    return (
      <>
        <button
          type="button"
          className={`${className} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
          onClick={async () => {
            if (!(await confirm("Restaurer ce document ? Il redeviendra visible selon sa visibilité."))) {
              return;
            }

            const result = await restoreDocumentAction(documentId);
            if (!result.success) {
              await alert(result.error, { variant: "error" });
              return;
            }

            router.refresh();
          }}
        >
          Restaurer
        </button>
        <button
          type="button"
          className={`${className} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
          onClick={async () => {
            if (
              !(await confirm(
                `Supprimer définitivement « ${documentTitle} » ? Cette action est irréversible.`,
                { variant: "danger", confirmLabel: "Supprimer" },
              ))
            ) {
              return;
            }

            const result = await deleteDocumentAction(documentId);
            if (!result.success) {
              await alert(result.error, { variant: "error" });
              return;
            }

            router.push("/admin/documents");
            router.refresh();
          }}
        >
          Supprimer
        </button>
      </>
    );
  }

  return (
    <button
      type="button"
      className={`${className} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
      onClick={async () => {
        if (
          !(await confirm("Archiver ce document ? Il ne sera plus visible sur le site.", {
            variant: "danger",
            confirmLabel: "Archiver",
          }))
        ) {
          return;
        }

        const result = await archiveDocumentAction(documentId);
        if (!result.success) {
          await alert(result.error, { variant: "error" });
          return;
        }

        router.refresh();
      }}
    >
      Archiver
    </button>
  );
}
