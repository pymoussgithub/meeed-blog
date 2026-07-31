import Link from "next/link";
import { ForumPostModerationActions } from "@/components/admin/ForumPostModerationActions";
import { ArticleContent } from "@/components/article/ArticleContent";
import { cn, formatDate } from "@/lib/utils";

type ForumPostItem = {
  id: string;
  body: string;
  createdAt: Date;
  isHidden?: boolean;
  deletedAt?: Date | null;
  author: { id: string; name: string };
};

type ForumPostListProps = {
  posts: ForumPostItem[];
  /** Index 0-based du premier message de la page (pour pagination). */
  startIndex?: number;
  /** Affiche les actions masquer / supprimer pour un ADMIN. */
  canModerate?: boolean;
};

function authorInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function avatarTone(name: string) {
  const tones = [
    "bg-accent/20 text-accent-dark",
    "bg-accent-blue/15 text-[#1a7aab]",
    "bg-accent-green/15 text-[#0f8a66]",
    "bg-primary/10 text-primary-dark",
  ] as const;
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % tones.length;
  }
  return tones[hash]!;
}

export function ForumPostList({
  posts,
  startIndex = 0,
  canModerate = false,
}: ForumPostListProps) {
  if (posts.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-primary/15 bg-bg-soft/30 px-4 py-8 text-center text-sm text-primary/60">
        Aucun message visible.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {posts.map((post, index) => {
        const number = startIndex + index + 1;
        const isOriginal = startIndex === 0 && index === 0;
        const isHidden = Boolean(post.isHidden);
        const isDeleted = Boolean(post.deletedAt);

        return (
          <li key={post.id} id={`post-${post.id}`}>
            <article
              className={cn(
                "overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md",
                isOriginal
                  ? "border-accent/35 ring-1 ring-accent/15"
                  : "border-primary/10",
                (isHidden || isDeleted) && "opacity-75",
              )}
            >
              <header
                className={cn(
                  "flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-5",
                  isOriginal
                    ? "border-accent/20 bg-bg-soft/50"
                    : "border-primary/8 bg-bg-soft/25",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold",
                    avatarTone(post.author.name),
                  )}
                  aria-hidden="true"
                >
                  {authorInitials(post.author.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-sm font-semibold text-primary-dark sm:text-base">
                      {post.author.name}
                    </p>
                    {isOriginal ? (
                      <span className="inline-flex items-center rounded-md bg-accent/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-dark">
                        Message initial
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-primary/6 px-2 py-0.5 text-[11px] font-medium text-primary/55">
                        Réponse
                      </span>
                    )}
                    {isHidden ? (
                      <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                        Masqué
                      </span>
                    ) : null}
                    {isDeleted ? (
                      <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800">
                        Supprimé
                      </span>
                    ) : null}
                  </div>
                  <time
                    dateTime={post.createdAt.toISOString()}
                    className="mt-0.5 block text-xs text-primary/50"
                  >
                    {formatDate(post.createdAt)}
                  </time>
                </div>

                <Link
                  href={`#post-${post.id}`}
                  className="ml-auto rounded-lg px-2 py-1 font-heading text-sm font-semibold tabular-nums text-primary/40 transition-colors hover:bg-white hover:text-accent-dark"
                  title={`Lien vers le message #${number}`}
                >
                  #{number}
                </Link>
              </header>

              <div
                className={cn(
                  "px-4 py-4 sm:px-5 sm:py-5",
                  isOriginal ? "border-l-4 border-l-accent" : "border-l-4 border-l-primary/10",
                )}
              >
                <ArticleContent html={post.body} />
              </div>

              {canModerate ? (
                <footer className="border-t border-primary/8 bg-bg-soft/20 px-4 py-3 sm:px-5">
                  <ForumPostModerationActions
                    postId={post.id}
                    isHidden={isHidden}
                    deletedAt={post.deletedAt ?? null}
                    compact
                  />
                </footer>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
