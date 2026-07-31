import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { ForumTopicListItem } from "@/lib/services/forum-topic.service";
import { formatDate } from "@/lib/utils";

type ForumTopicListProps = {
  topics: ForumTopicListItem[];
  showCategory?: boolean;
  emptyMessage?: string;
};

function replyCount(postsCount: number) {
  return Math.max(0, postsCount - 1);
}

export function ForumTopicList({
  topics,
  showCategory = false,
  emptyMessage = "Aucun sujet pour le moment.",
}: ForumTopicListProps) {
  if (topics.length === 0) {
    return <p className="text-center text-primary/60">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-primary/10 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-primary/10 bg-bg-soft/60 text-primary/70">
          <tr>
            <th className="min-w-[14rem] px-4 py-3 text-left font-heading font-semibold text-primary-dark">
              Sujet
            </th>
            <th className="hidden whitespace-nowrap px-4 py-3 text-center font-heading font-semibold text-primary-dark md:table-cell">
              Date
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-center font-heading font-semibold text-primary-dark">
              Réponses
            </th>
            <th className="hidden whitespace-nowrap px-4 py-3 text-center font-heading font-semibold text-primary-dark sm:table-cell">
              Créateur
            </th>
            <th className="hidden min-w-[10rem] px-4 py-3 text-center font-heading font-semibold text-primary-dark lg:table-cell">
              Dernière réponse
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {topics.map((topic) => {
            const replies = replyCount(topic.postsCount);
            const lastPost = topic.posts[0] ?? null;
            const showLastReply = replies > 0 && lastPost;

            return (
              <tr
                key={topic.id}
                className="transition-colors hover:bg-bg-soft/40"
                data-tour-id="forum.topic.row"
              >
                <td className="px-4 py-3 text-left align-middle">
                  <div className="flex flex-wrap items-center gap-2">
                    {topic.isPinned ? <Badge color="#3b9a93">Épinglé</Badge> : null}
                    {topic.status === "LOCKED" ? (
                      <Badge color="#292f36">Verrouillé</Badge>
                    ) : null}
                    <Link
                      href={`/forum/s/${topic.slug}`}
                      className="font-heading text-base font-semibold text-primary-dark hover:text-accent-dark"
                    >
                      {topic.title}
                    </Link>
                  </div>
                  {showCategory ? (
                    <p className="mt-1 text-xs text-primary/55">
                      <Link
                        href={`/forum/r/${topic.category.slug}`}
                        className="hover:text-accent-dark"
                      >
                        {topic.category.name}
                      </Link>
                    </p>
                  ) : null}
                  <div className="mt-2 space-y-0.5 text-xs text-primary/55 lg:hidden">
                    <p className="md:hidden">{formatDate(topic.createdAt)}</p>
                    <p className="sm:hidden">Par {topic.author.name}</p>
                    <p>
                      {showLastReply
                        ? `Dernière réponse : ${formatDate(lastPost.createdAt)} · ${lastPost.author.name}`
                        : "Aucune réponse"}
                    </p>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-center align-middle text-primary/65 md:table-cell">
                  {formatDate(topic.createdAt)}
                </td>
                <td className="px-4 py-3 text-center align-middle tabular-nums text-primary/65">
                  {replies}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-center align-middle text-primary/65 sm:table-cell">
                  {topic.author.name}
                </td>
                <td className="hidden px-4 py-3 text-center align-middle text-primary/65 lg:table-cell">
                  {showLastReply ? (
                    <div>
                      <p>{formatDate(lastPost.createdAt)}</p>
                      <p className="text-xs text-primary/50">{lastPost.author.name}</p>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
