import { getNewsCategories } from "@/lib/articles-listing";
import { resolveCoverUrl } from "@/lib/cloudinary";
import type { ArticleListingItem, ArticleWithRelations } from "@/lib/services/article.service";

export type CarouselArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  publishedAt: string | null;
  categoryLabel: string;
  authorName: string | null;
};

type CarouselArticleSource = ArticleListingItem | ArticleWithRelations;

/** unstable_cache JSON-ifie les Date → string ; on accepte les deux. */
function toIsoDateString(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return value.toISOString();
}

export function toCarouselArticle(
  article: CarouselArticleSource,
  categoryLabel?: string,
): CarouselArticle {
  const coverUrl = resolveCoverUrl(article.coverImagePublicId, article.coverImageUrl, "card");
  const newsCategories = getNewsCategories(article);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverUrl,
    publishedAt: toIsoDateString(article.publishedAt),
    categoryLabel: categoryLabel ?? newsCategories[0]?.name ?? "Actualité",
    authorName: article.author?.name ?? null,
  };
}
