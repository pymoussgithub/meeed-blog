import Link from "next/link";
import Image from "next/image";
import { getCoverCardUrl } from "@/lib/cloudinary";
import {
  getArticleKind,
  getLinkedProject,
  getNewsCategories,
} from "@/lib/articles-listing";
import type { ArticleWithRelations } from "@/lib/services/article.service";
import { cn, formatDate } from "@/lib/utils";

type ArticleCompactCardProps = {
  article: ArticleWithRelations;
};

function getCoverUrl(article: ArticleWithRelations) {
  if (article.coverImagePublicId) {
    return getCoverCardUrl(article.coverImagePublicId);
  }
  return article.coverImageUrl;
}

function CategoryBadge({ article }: { article: ArticleWithRelations }) {
  const kind = getArticleKind(article);
  const project = getLinkedProject(article);
  const newsCategory = getNewsCategories(article)[0];

  if (kind !== "project" || !project) {
    return (
      <span className="inline-flex max-w-full truncate rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        {newsCategory?.name ?? "Actualité"}
      </span>
    );
  }

  return (
    <span
      className="inline-flex max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: project.color ?? "var(--color-accent-dark)" }}
    >
      {project.title}
    </span>
  );
}

export function ArticleCompactCard({ article }: ArticleCompactCardProps) {
  const coverUrl = getCoverUrl(article);
  const href = `/a/${article.slug}`;
  const isNews = getArticleKind(article) !== "project";

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md",
        isNews ? "border-accent/25 ring-1 ring-accent/10" : "border-gray-200",
      )}
    >
      <Link
        href={href}
        className="relative block aspect-[16/10] shrink-0 overflow-hidden bg-bg-soft p-3 sm:p-4"
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-primary/25">
            MEEED
          </div>
        )}
        <div className="absolute left-2 top-2">
          <CategoryBadge article={article} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        {article.publishedAt ? (
          <time
            dateTime={article.publishedAt.toISOString()}
            className="text-[11px] text-primary/45"
          >
            {formatDate(article.publishedAt)}
          </time>
        ) : null}

        <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-snug">
          <Link href={href} className="transition-colors hover:text-accent-dark">
            {article.title}
          </Link>
        </h2>

        {article.author?.name ? (
          <p className="mt-auto pt-2 text-[11px] text-primary/40">{article.author.name}</p>
        ) : null}
      </div>
    </article>
  );
}
