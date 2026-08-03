"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  hardDeleteForumTopicAction,
  hideForumTopicAction,
  moveForumTopicAction,
  setForumTopicPinnedAction,
  setForumTopicStatusAction,
} from "@/actions/forum-moderation.actions";
import { ForumTopicStatusBadge } from "@/components/admin/ForumTopicStatusBadge";
import { Badge } from "@/components/ui/Badge";
import { useDialog } from "@/components/ui/DialogProvider";
import { Toast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

type TopicRow = {
  id: string;
  title: string;
  slug: string;
  status: "OPEN" | "LOCKED" | "ARCHIVED";
  isPinned: boolean;
  isHidden: boolean;
  deletedAt: Date | string | null;
  postsCount: number;
  updatedAt: Date | string;
  category: { id: string; name: string; slug: string };
  author: { id: string; name: string };
};

type CategoryOption = { id: string; name: string };

type ForumModerationTableProps = {
  topics: TopicRow[];
  categories: CategoryOption[];
};

const tableActionClassName =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function ForumModerationTable({ topics, categories }: ForumModerationTableProps) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const run = async (topicId: string, action: () => Promise<{ success: boolean; error?: string }>) => {
    setPendingId(topicId);
    const result = await action();
    setPendingId(null);
    if (!result.success) {
      setToast({ message: result.error ?? "Erreur", variant: "error" });
      return;
    }
    setToast({ message: "Modération enregistrée.", variant: "success" });
    router.refresh();
  };

  const handleHardDelete = async (topic: TopicRow) => {
    const ok = await confirm(
      `Attention : vous allez supprimer définitivement la discussion « ${topic.title} ».\n\nCette action efface toute la conversation, toutes les réponses et les inscriptions liées. Elle est irréversible.`,
      {
        title: "Supprimer définitivement ?",
        variant: "danger",
        confirmLabel: "Supprimer définitivement",
        requireText: "supprimer",
      },
    );
    if (!ok) return;
    await run(topic.id, () => hardDeleteForumTopicAction(topic.id));
  };

  return (
    <>
      <div
        className="overflow-x-auto rounded-xl border border-gray-200 bg-white"
        data-tour-id="admin.forum.moderation"
      >
        <table className="w-full table-fixed text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left">
            <tr>
              <th className="w-[18%] px-3 py-3 font-medium">Discussion</th>
              <th className="w-[8%] px-2 py-3 font-medium">Statut</th>
              <th className="hidden w-[9%] px-2 py-3 font-medium lg:table-cell">Auteur</th>
              <th className="hidden w-[9%] px-2 py-3 font-medium xl:table-cell">Rubrique</th>
              <th className="w-[6%] px-2 py-3 font-medium text-center">Msg</th>
              <th className="hidden w-[10%] px-2 py-3 font-medium md:table-cell">Modifié</th>
              <th className="w-[40%] px-3 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topics.map((topic) => {
              const pending = pendingId === topic.id;

              return (
                <tr key={topic.id} className="group hover:bg-gray-50/60">
                  <td className="px-3 py-3 align-top">
                    <div className="min-w-0">
                      <Link
                        href={`/forum/s/${topic.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-2 font-medium text-primary-dark hover:text-accent-dark"
                      >
                        {topic.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {topic.isPinned ? <Badge color="#292f36">Épinglé</Badge> : null}
                        {topic.isHidden ? <Badge color="#e09f3e">Masqué</Badge> : null}
                        {topic.deletedAt ? <Badge color="#c0392b">Supprimé</Badge> : null}
                      </div>
                      <p className="mt-1 truncate text-xs text-primary/45 lg:hidden">
                        {topic.author.name}
                        <span className="xl:hidden"> · {topic.category.name}</span>
                      </p>
                    </div>
                  </td>
                  <td className="px-2 py-3 align-top">
                    <ForumTopicStatusBadge status={topic.status} />
                  </td>
                  <td className="hidden truncate px-2 py-3 align-top text-primary/70 lg:table-cell">
                    {topic.author.name}
                  </td>
                  <td className="hidden truncate px-2 py-3 align-top text-primary/70 xl:table-cell">
                    {topic.category.name}
                  </td>
                  <td className="px-2 py-3 align-top text-center text-primary/70">
                    {topic.postsCount}
                  </td>
                  <td className="hidden whitespace-nowrap px-2 py-3 align-top text-xs text-primary/70 md:table-cell">
                    {formatDate(topic.updatedAt)}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/forum/s/${topic.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                      >
                        Voir
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                        onClick={() =>
                          run(topic.id, () => setForumTopicPinnedAction(topic.id, !topic.isPinned))
                        }
                      >
                        {topic.isPinned ? "Retirer des importants" : "Épingler comme important"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                        onClick={() =>
                          run(topic.id, () =>
                            setForumTopicStatusAction(
                              topic.id,
                              topic.status === "LOCKED" ? "OPEN" : "LOCKED",
                            ),
                          )
                        }
                      >
                        {topic.status === "LOCKED" ? "Déverrouiller" : "Verrouiller"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                        onClick={() =>
                          run(topic.id, () =>
                            setForumTopicStatusAction(
                              topic.id,
                              topic.status === "ARCHIVED" ? "OPEN" : "ARCHIVED",
                            ),
                          )
                        }
                      >
                        {topic.status === "ARCHIVED" ? "Désarchiver" : "Archiver"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                        data-tour-id={topic.isHidden ? "admin.forum.restore" : "admin.forum.hide"}
                        onClick={() =>
                          run(topic.id, () => hideForumTopicAction(topic.id, !topic.isHidden))
                        }
                      >
                        {topic.isHidden ? "Afficher" : "Masquer"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className={`${tableActionClassName} border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
                        onClick={() => {
                          void handleHardDelete(topic);
                        }}
                      >
                        Supprimer
                      </button>
                      <label className="sr-only" htmlFor={`move-${topic.id}`}>
                        Déplacer vers
                      </label>
                      <select
                        id={`move-${topic.id}`}
                        defaultValue={topic.category.id}
                        disabled={pending}
                        aria-label="Déplacer vers une rubrique"
                        data-tour-id="admin.forum.move"
                        className="max-w-[9.5rem] rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-primary/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                        onChange={(event) => {
                          const categoryId = event.target.value;
                          if (categoryId === topic.category.id) return;
                          void run(topic.id, () => moveForumTopicAction(topic.id, categoryId));
                        }}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            → {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
