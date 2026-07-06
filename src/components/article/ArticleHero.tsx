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
    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl">
      <Image
        src={coverUrl}
        alt={article.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
        priority
      />
    </div>
  );
}
