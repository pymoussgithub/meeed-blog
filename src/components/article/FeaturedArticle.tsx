import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { resolveCoverUrl } from "@/lib/cloudinary";
import type { ArticleWithRelations } from "@/lib/services/article.service";
import { formatDate } from "@/lib/utils";

type FeaturedArticleProps = {
  article: ArticleWithRelations;
};

function getCoverUrl(article: ArticleWithRelations) {
  return resolveCoverUrl(article.coverImagePublicId, article.coverImageUrl, "hero");
}

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const primaryCategory = article.categories[0]?.category;
  const coverUrl = getCoverUrl(article);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid md:grid-cols-2">
        <Link href={`/a/${article.slug}`} className="relative block min-h-64 bg-bg-soft md:min-h-96">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              referrerPolicy="no-referrer"
            />
          ) : null}
        </Link>

        <div className="flex flex-col justify-center p-8">
          <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">À la une</p>
          {primaryCategory ? (
            <div className="mt-3">
              <Link href={`/c/${primaryCategory.slug}`}>
                <Badge color={primaryCategory.color ?? undefined}>{primaryCategory.name}</Badge>
              </Link>
            </div>
          ) : null}
          <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">
            <Link href={`/a/${article.slug}`} className="hover:text-accent-dark">
              {article.title}
            </Link>
          </h2>
          <p className="mt-4 text-primary/70">{article.excerpt}</p>
          {article.publishedAt ? (
            <p className="mt-3 text-sm text-primary/50">{formatDate(article.publishedAt)}</p>
          ) : null}
          <Link
            href={`/a/${article.slug}`}
            className="mt-6 inline-flex text-sm font-semibold text-accent-dark hover:underline"
          >
            Lire l&apos;article →
          </Link>
        </div>
      </div>
    </article>
  );
}
