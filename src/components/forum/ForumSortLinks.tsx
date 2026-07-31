import Link from "next/link";
import { FORUM_SORT_LABELS } from "@/lib/forum-listing";
import type { ForumTopicSort } from "@/lib/validations/forum";
import { cn } from "@/lib/utils";

type ForumSortLinksProps = {
  basePath: string;
  currentSort: ForumTopicSort;
};

export function ForumSortLinks({ basePath, currentSort }: ForumSortLinksProps) {
  const sorts = Object.keys(FORUM_SORT_LABELS) as ForumTopicSort[];

  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className="text-primary/40">Trier</span>
      {sorts.map((sort) => {
        const href = sort === "recent" ? basePath : `${basePath}?sort=${sort}`;
        const active = sort === currentSort;

        return (
          <Link
            key={sort}
            href={href}
            className={cn(
              "rounded px-1.5 py-0.5 transition-colors",
              active
                ? "bg-accent/15 font-medium text-accent-dark"
                : "text-primary/50 hover:bg-bg-soft hover:text-primary",
            )}
            aria-current={active ? "page" : undefined}
          >
            {FORUM_SORT_LABELS[sort]}
          </Link>
        );
      })}
    </div>
  );
}
