import Link from "next/link";
import { ShareBar } from "@/components/article/ShareBar";
import { Badge } from "@/components/ui/Badge";
import type { ArticleWithRelations } from "@/lib/services/article.service";
import { formatDate } from "@/lib/utils";

type ArticleMetaProps = {
  article: ArticleWithRelations;
  shareTitle: string;
  shareUrl: string;
};

export function ArticleMeta({ article, shareTitle, shareUrl }: ArticleMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-primary/60">
      {article.publishedAt ? <span>{formatDate(article.publishedAt)}</span> : null}
      {article.author?.name ? (
        <>
          <span aria-hidden>·</span>
          <span>{article.author.name}</span>
        </>
      ) : null}
      {article.project ? (
        <>
          <span aria-hidden>·</span>
          <Link href={`/actualites?project=${article.project.slug}`}>
            <Badge color={article.project.color ?? undefined}>{article.project.title}</Badge>
          </Link>
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
      <span aria-hidden>·</span>
      <ShareBar title={shareTitle} url={shareUrl} />
    </div>
  );
}
