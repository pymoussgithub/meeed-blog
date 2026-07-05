"use client";

import { ArticleStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  archiveArticleAction,
  deleteArticleAction,
  republishArticleAction,
} from "@/actions/article.actions";
import { useDialog } from "@/components/ui/DialogProvider";

type ArticleListActionsProps = {
  articleId: string;
  status: ArticleStatus;
};

export function ArticleListActions({ articleId, status }: ArticleListActionsProps) {
  const router = useRouter();
  const { confirm, alert } = useDialog();

  if (status === ArticleStatus.ARCHIVED) {
    return (
      <>
        <button
          type="button"
          className="text-accent-dark hover:underline"
          onClick={async () => {
            if (!(await confirm("Republier cet article ?"))) return;

            const result = await republishArticleAction(articleId);
            if (!result.success) {
              await alert(result.error, { variant: "error" });
              return;
            }

            router.refresh();
          }}
        >
          Republier
        </button>
        <button
          type="button"
          className="text-red-600 hover:underline"
          onClick={async () => {
            if (
              !(await confirm(
                "Supprimer définitivement cet article ? Cette action est irréversible.",
                { variant: "danger", confirmLabel: "Supprimer" },
              ))
            ) {
              return;
            }

            const result = await deleteArticleAction(articleId);
            if (!result.success) {
              await alert(result.error, { variant: "error" });
              return;
            }

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
      className="text-red-600 hover:underline"
      onClick={async () => {
        if (
          !(await confirm("Archiver cet article ? Il ne sera plus visible sur le site.", {
            variant: "danger",
            confirmLabel: "Archiver",
          }))
        ) {
          return;
        }

        const result = await archiveArticleAction(articleId);
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
