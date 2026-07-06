import Image from "next/image";
import { getCoverHeroUrl } from "@/lib/cloudinary";
import type { ArticleWithRelations } from "@/lib/services/article.service";

type ArticleHeroProps = {
  article: ArticleWithRelations;
};

function getCoverUrl(article: ArticleWithRelations) {
  if (article.coverImagePublicId) {
    return getCoverHeroUrl(article.coverImagePublicId);
  }
  return article.coverImageUrl;
}

export function ArticleHero({ article }: ArticleHeroProps) {
  const coverUrl = getCoverUrl(article);

  if (!coverUrl) {
    return null;
  }

  return (
    <div className="relative mx-auto h-48 w-full max-w-3xl overflow-hidden rounded-xl bg-bg-soft sm:h-56 md:h-64">
      <Image
        src={coverUrl}
        alt={article.title}
        fill
        className="object-contain p-4 sm:p-6"
        sizes="(max-width: 768px) 100vw, 768px"
        priority
      />
    </div>
  );
}
