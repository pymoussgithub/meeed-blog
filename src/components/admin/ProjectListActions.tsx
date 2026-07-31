"use client";

import { useRouter } from "next/navigation";
import { deleteProjectAction, updateProjectAction } from "@/actions/project.actions";
import { useDialog } from "@/components/ui/DialogProvider";

type ProjectListActionsProps = {
  projectId: string;
  projectTitle: string;
  isActive: boolean;
  className?: string;
};

export function ProjectListActions({
  projectId,
  projectTitle,
  isActive,
  className = "",
}: ProjectListActionsProps) {
  const router = useRouter();
  const { confirm, alert } = useDialog();

  return (
    <>
      <button
        type="button"
        className={`${className} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
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
        className={`${className} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        onClick={async () => {
          if (
            !(await confirm(
              `Supprimer définitivement le projet « ${projectTitle} » ? La catégorie associée et ses articles seront conservés.`,
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
