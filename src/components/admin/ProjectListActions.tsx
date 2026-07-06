"use client";

import { useRouter } from "next/navigation";
import { deleteProjectAction, updateProjectAction } from "@/actions/project.actions";
import { useDialog } from "@/components/ui/DialogProvider";

type ProjectListActionsProps = {
  projectId: string;
  projectTitle: string;
  articleCount: number;
  isActive: boolean;
};

export function ProjectListActions({
  projectId,
  projectTitle,
  articleCount,
  isActive,
}: ProjectListActionsProps) {
  const router = useRouter();
  const { confirm, alert } = useDialog();

  return (
    <>
      <button
        type="button"
        className="text-primary/60 hover:text-accent-dark hover:underline"
        onClick={async () => {
          const result = await updateProjectAction(projectId, { isActive: !isActive });
          if (!result.success) {
            await alert(result.error, { variant: "error" });
            return;
          }
          router.refresh();
        }}
      >
        {isActive ? "Masquer" : "Afficher"}
      </button>
      <button
        type="button"
        className="text-red-600 hover:underline"
        onClick={async () => {
          const articleWarning =
            articleCount > 0
              ? `\n\nAttention : ${articleCount} article${articleCount > 1 ? "s" : ""} associé${articleCount > 1 ? "s" : ""} à ce projet seront également supprimé${articleCount > 1 ? "s" : ""} définitivement.`
              : "";

          if (
            !(await confirm(
              `Supprimer définitivement le projet « ${projectTitle} » ? Cette action est irréversible.${articleWarning}`,
              { variant: "danger", confirmLabel: "Supprimer" },
            ))
          ) {
            return;
          }

          const result = await deleteProjectAction(projectId);
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
