"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setForumTopicSubscriptionAction } from "@/actions/forum.actions";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

type SubscriptionRow = {
  updatedAt: Date;
  topic: {
    id: string;
    title: string;
    slug: string;
    status: "OPEN" | "LOCKED" | "ARCHIVED";
    lastPostAt: Date | null;
    postsCount: number;
    category: { name: string; slug: string };
    articles: Array<{
      article: {
        id: string;
        title: string;
        slug: string;
        status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      };
    }>;
  };
};

type ForumSubscriptionsTableProps = {
  subscriptions: SubscriptionRow[];
};

const statusLabel: Record<SubscriptionRow["topic"]["status"], string> = {
  OPEN: "Ouvert",
  LOCKED: "Verrouillé",
  ARCHIVED: "Archivé",
};

export function ForumSubscriptionsTable({ subscriptions }: ForumSubscriptionsTableProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const unsubscribe = async (topicId: string) => {
    setPendingId(topicId);
    const result = await setForumTopicSubscriptionAction(topicId, false);
    setPendingId(null);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({
      message: "Vous êtes désinscrit de cette discussion.",
      variant: "success",
    });
    router.refresh();
  };

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/15 bg-bg-soft/30 px-4 py-8 text-center text-sm text-primary/60">
        Vous ne suivez encore aucune discussion du forum.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-bg-soft/40 text-xs uppercase tracking-wide text-primary/55">
          <tr>
            <th className="px-4 py-3 font-semibold">Discussion</th>
            <th className="px-4 py-3 font-semibold">Rubrique</th>
            <th className="px-4 py-3 font-semibold">Statut</th>
            <th className="px-4 py-3 font-semibold">Messages</th>
            <th className="px-4 py-3 font-semibold">Dernière activité</th>
            <th className="px-4 py-3 font-semibold">Articles liés</th>
            <th className="px-4 py-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(({ topic, updatedAt }) => {
            const publishedArticles = topic.articles
              .map((link) => link.article)
              .filter((article) => article.status === "PUBLISHED");

            return (
              <tr key={topic.id} className="border-b border-gray-100 last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/forum/s/${topic.slug}`}
                    className="font-medium text-primary-dark hover:text-accent-dark"
                  >
                    {topic.title}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top text-primary/70">
                  <Link
                    href={`/forum/r/${topic.category.slug}`}
                    className="hover:text-accent-dark"
                  >
                    {topic.category.name}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top text-primary/70">
                  {statusLabel[topic.status]}
                </td>
                <td className="px-4 py-3 align-top text-primary/70">{topic.postsCount}</td>
                <td className="px-4 py-3 align-top text-primary/70">
                  {formatDate(topic.lastPostAt ?? updatedAt)}
                </td>
                <td className="max-w-xs px-4 py-3 align-top text-primary/70">
                  {publishedArticles.length > 0
                    ? publishedArticles.map((article) => article.title).join(", ")
                    : "—"}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-lg px-3 py-1.5 text-xs"
                    disabled={pendingId === topic.id}
                    onClick={() => unsubscribe(topic.id)}
                  >
                    {pendingId === topic.id ? "…" : "Se désinscrire"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
