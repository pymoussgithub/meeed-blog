import Image from "next/image";
import { resolveCoverUrl } from "@/lib/cloudinary";
import type { ArticleWithRelations } from "@/lib/services/article.service";

type ArticleHeroProps = {
  article: ArticleWithRelations;
};

export function ArticleHero({ article }: ArticleHeroProps) {
  const coverUrl = resolveCoverUrl(article.coverImagePublicId, article.coverImageUrl, "hero");

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
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
