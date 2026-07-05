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
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-bg-soft">
      <Image
        src={coverUrl}
        alt={article.title}
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
    </div>
  );
}
