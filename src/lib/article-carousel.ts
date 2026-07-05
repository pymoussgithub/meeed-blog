import { getNewsCategories } from "@/lib/articles-listing";
import { getCoverCardUrl } from "@/lib/cloudinary";
import type { ArticleWithRelations } from "@/lib/services/article.service";

export type CarouselArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  publishedAt: string | null;
  categoryLabel: string;
};

export function toCarouselArticle(article: ArticleWithRelations): CarouselArticle {
  const coverUrl = article.coverImagePublicId
    ? getCoverCardUrl(article.coverImagePublicId)
    : article.coverImageUrl;
  const newsCategories = getNewsCategories(article);

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverUrl,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    categoryLabel: newsCategories[0]?.name ?? "Actualité",
  };
}
