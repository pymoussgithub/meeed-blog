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
  className?: string;
};

export function ArticleListActions({
  articleId,
  status,
  className = "",
}: ArticleListActionsProps) {
  const router = useRouter();
  const { confirm, alert } = useDialog();

  if (status === ArticleStatus.ARCHIVED) {
    return (
      <>
        <button
          type="button"
          className={`${className} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
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
          className={`${className} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
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
      className={`${className} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
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
