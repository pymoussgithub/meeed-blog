import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { ArticleWithRelations } from "@/lib/services/article.service";
import { formatDate } from "@/lib/utils";

type ArticleMetaProps = {
  article: ArticleWithRelations;
};

export function ArticleMeta({ article }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-primary/60">
      {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
      {article.author?.name ? (
        <>
          <span aria-hidden>·</span>
          <span>{article.author.name}</span>
        </>
      ) : null}
      {article.categories.length > 0 ? (
        <>
          <span aria-hidden>·</span>
          <div className="flex flex-wrap gap-2">
            {article.categories.map((item) => (
              <Link key={item.categoryId} href={`/c/${item.category.slug}`}>
                <Badge color={item.category.color ?? undefined}>{item.category.name}</Badge>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
