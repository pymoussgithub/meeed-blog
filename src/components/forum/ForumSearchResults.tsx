import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  FORUM_SEARCH_MARK_END,
  FORUM_SEARCH_MARK_START,
  type ForumSearchHit,
} from "@/lib/services/forum-search.service";
import { formatDate } from "@/lib/utils";

type ForumSearchResultsProps = {
  hits: ForumSearchHit[];
  /** Mot-clé titre (filtre ILIKE) — surlignage client si pas de snippet FTS. */
  titleQuery?: string;
};

function replyCount(postsCount: number) {
  return Math.max(0, postsCount - 1);
}

function renderMarkedSnippet(excerpt: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = excerpt;
  let key = 0;

  while (remaining.length > 0) {
    const start = remaining.indexOf(FORUM_SEARCH_MARK_START);
    if (start === -1) {
      nodes.push(remaining);
      break;
    }
    if (start > 0) {
      nodes.push(remaining.slice(0, start));
    }
    remaining = remaining.slice(start + FORUM_SEARCH_MARK_START.length);
    const end = remaining.indexOf(FORUM_SEARCH_MARK_END);
    if (end === -1) {
      nodes.push(remaining);
      break;
    }
    nodes.push(
      <mark
        key={key}
        className="rounded-sm bg-accent/20 px-0.5 font-semibold text-primary-dark"
      >
        {remaining.slice(0, end)}
      </mark>,
    );
    key += 1;
    remaining = remaining.slice(end + FORUM_SEARCH_MARK_END.length);
  }

  return nodes;
}

function highlightPlainMatch(text: string, query?: string): ReactNode {
  const needle = query?.trim();
  if (!needle) return text;

  const lower = text.toLowerCase();
  const q = needle.toLowerCase();
  const index = lower.indexOf(q);
  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent/20 px-0.5 font-semibold text-primary-dark">
        {text.slice(index, index + needle.length)}
      </mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export function ForumSearchResults({ hits, titleQuery }: ForumSearchResultsProps) {
  if (hits.length === 0) {
    return <p className="text-sm text-primary/60">Aucun résultat pour ces critères.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-primary/10 bg-white">
      <table className="min-w-full text-sm">
        <thead className="border-b border-primary/10 bg-bg-soft/60 font-heading font-semibold text-primary-dark">
          <tr>
            <th className="min-w-[16rem] px-4 py-3 text-left">Résultat</th>
            <th className="hidden whitespace-nowrap px-4 py-3 text-center md:table-cell">
              Date
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-center">Réponses</th>
            <th className="hidden whitespace-nowrap px-4 py-3 text-center sm:table-cell">
              Créateur
            </th>
            <th className="hidden min-w-[10rem] px-4 py-3 text-center lg:table-cell">
              Dernière réponse
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {hits.map((hit) => {
            const replies = replyCount(hit.postsCount);
            const showLastReply = replies > 0 && hit.lastPostAt;
            const href = hit.postId
              ? `/forum/s/${hit.topicSlug}#post-${hit.postId}`
              : `/forum/s/${hit.topicSlug}`;
            const hasMarkedExcerpt = hit.excerpt.includes(FORUM_SEARCH_MARK_START);
            const plainExcerpt = hit.excerpt
              .replaceAll(FORUM_SEARCH_MARK_START, "")
              .replaceAll(FORUM_SEARCH_MARK_END, "")
              .trim();
            const titleNode =
              hit.kind === "topic" && hasMarkedExcerpt
                ? renderMarkedSnippet(hit.excerpt)
                : highlightPlainMatch(hit.topicTitle, titleQuery);
            const showSnippet = hit.kind === "post" && Boolean(plainExcerpt);

            return (
              <tr
                key={`${hit.kind}-${hit.postId ?? hit.topicId}`}
                className="transition-colors hover:bg-bg-soft/40"
                data-tour-id="forum.search.result"
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color={hit.kind === "post" ? "#5b6b7c" : "#3b9a93"}>
                      {hit.kind === "post" ? "Réponse" : "Sujet"}
                    </Badge>
                    {hit.isPinned ? <Badge color="#3b9a93">Épinglé</Badge> : null}
                    {hit.status === "LOCKED" ? (
                      <Badge color="#292f36">Verrouillé</Badge>
                    ) : null}
                    <Link
                      href={href}
                      className="font-heading text-base font-semibold text-primary-dark hover:text-accent-dark"
                    >
                      {titleNode}
                    </Link>
                  </div>

                  <p className="mt-1 text-xs text-primary/55">
                    <Link
                      href={`/forum/r/${hit.categorySlug}`}
                      className="hover:text-accent-dark"
                    >
                      {hit.categoryName}
                    </Link>
                    {hit.kind === "post" ? (
                      <>
                        {" · "}
                        Réponse de {hit.matchedAuthorName}
                        {" · "}
                        {formatDate(hit.matchedAt)}
                      </>
                    ) : null}
                  </p>

                  {showSnippet ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-primary/65">
                      {hasMarkedExcerpt
                        ? renderMarkedSnippet(hit.excerpt)
                        : plainExcerpt}
                    </p>
                  ) : null}

                  <div className="mt-2 space-y-0.5 text-xs text-primary/55 lg:hidden">
                    <p className="md:hidden">{formatDate(hit.topicCreatedAt)}</p>
                    <p className="sm:hidden">Par {hit.topicAuthorName}</p>
                    <p>
                      {showLastReply && hit.lastPostAt
                        ? `Dernière réponse : ${formatDate(hit.lastPostAt)} · ${hit.lastPostAuthorName ?? "—"}`
                        : "Aucune réponse"}
                    </p>
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-center align-middle text-primary/65 md:table-cell">
                  {formatDate(hit.topicCreatedAt)}
                </td>
                <td className="px-4 py-3 text-center align-middle tabular-nums text-primary/65">
                  {replies}
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-center align-middle text-primary/65 sm:table-cell">
                  {hit.topicAuthorName}
                </td>
                <td className="hidden px-4 py-3 text-center align-middle text-primary/65 lg:table-cell">
                  {showLastReply && hit.lastPostAt ? (
                    <div>
                      <p>{formatDate(hit.lastPostAt)}</p>
                      <p className="text-xs text-primary/50">
                        {hit.lastPostAuthorName ?? "—"}
                      </p>
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
