import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getCoverCardUrl } from "@/lib/cloudinary";
import type { ArticleWithRelations } from "@/lib/services/article.service";
import { formatDate } from "@/lib/utils";

type ArticleCardProps = {
  article: ArticleWithRelations;
};

function getCoverUrl(article: ArticleWithRelations) {
  if (article.coverImagePublicId) {
    return getCoverCardUrl(article.coverImagePublicId);
  }
  return article.coverImageUrl;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const primaryCategory = article.categories[0]?.category;
  const coverUrl = getCoverUrl(article);

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <Link href={`/a/${article.slug}`} className="block">
        <div className="relative aspect-video w-full bg-bg-soft">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-primary/40">
              MEEED
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          {primaryCategory ? (
            <Link href={`/c/${primaryCategory.slug}`}>
              <Badge color={primaryCategory.color ?? undefined}>{primaryCategory.name}</Badge>
            </Link>
          ) : (
            <span />
          )}
          {article.publishedAt ? (
            <span className="text-xs text-primary/50">{formatDate(article.publishedAt)}</span>
          ) : null}
        </div>

        <h3 className="text-lg font-semibold leading-snug">
          <Link href={`/a/${article.slug}`} className="transition-colors hover:text-accent-dark">
            {article.title}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-primary/70 line-clamp-3">
          {article.excerpt}
        </p>

        <Link
          href={`/a/${article.slug}`}
          className="mt-4 text-sm font-medium text-accent-dark hover:underline"
        >
          Lire l&apos;article →
        </Link>
      </div>
    </Card>
  );
}
