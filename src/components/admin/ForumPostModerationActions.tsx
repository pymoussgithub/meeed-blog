"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  hideForumPostAction,
  restoreForumPostAction,
  softDeleteForumPostAction,
} from "@/actions/forum-moderation.actions";
import { DialogProvider, useDialog } from "@/components/ui/DialogProvider";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type ForumPostModerationActionsProps = {
  postId: string;
  isHidden: boolean;
  deletedAt: Date | string | null;
  /** Compact buttons for inline use in a thread or table. */
  compact?: boolean;
};

const tableActionClassName =
  "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function ForumPostModerationActions(props: ForumPostModerationActionsProps) {
  return (
    <DialogProvider>
      <ForumPostModerationActionsInner {...props} />
    </DialogProvider>
  );
}

function ForumPostModerationActionsInner({
  postId,
  isHidden,
  deletedAt,
  compact = false,
}: ForumPostModerationActionsProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const isDeleted = Boolean(deletedAt);
  const sizeClass = compact ? undefined : "px-4 py-2 text-sm";

  const run = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    setPending(true);
    const result = await action();
    setPending(false);
    if (!result.success) {
      setToast({ message: result.error ?? "Erreur", variant: "error" });
      return;
    }
    setToast({ message: "Modération enregistrée.", variant: "success" });
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={cn(
          tableActionClassName,
          "border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20",
          sizeClass,
        )}
        disabled={pending}
        onClick={() => run(() => hideForumPostAction(postId, !isHidden))}
      >
        {isHidden ? "Afficher" : "Masquer"}
      </button>
      {isDeleted ? (
        <button
          type="button"
          className={cn(
            tableActionClassName,
            "border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20",
            sizeClass,
          )}
          disabled={pending}
          onClick={() => run(() => restoreForumPostAction(postId))}
        >
          Restaurer
        </button>
      ) : (
        <button
          type="button"
          className={cn(
            tableActionClassName,
            "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
            sizeClass,
          )}
          disabled={pending}
          onClick={() => {
            void (async () => {
              const ok = await confirm(
                "Supprimer ce message ? Le sujet et les autres réponses restent visibles.",
                {
                  title: "Supprimer le message ?",
                  variant: "danger",
                  confirmLabel: "Supprimer",
                },
              );
              if (!ok) return;
              await run(() => softDeleteForumPostAction(postId));
            })();
          }}
        >
          Supprimer
        </button>
      )}

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
