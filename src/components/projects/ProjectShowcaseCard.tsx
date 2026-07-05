import Image from "next/image";
import Link from "next/link";
import { getCoverProjectUrl } from "@/lib/cloudinary";
import type { ActiveProject } from "@/lib/services/project.service";
import { cn } from "@/lib/utils";

type ProjectShowcaseCardProps = {
  project: ActiveProject;
  imageOnRight?: boolean;
  className?: string;
};

function getProjectCoverUrl(project: ActiveProject) {
  const article = project.category.articles[0]?.article;
  if (!article) {
    return null;
  }
  if (article.coverImagePublicId) {
    return getCoverProjectUrl(article.coverImagePublicId);
  }
  return article.coverImageUrl;
}

export function ProjectShowcaseCard({
  project,
  imageOnRight = false,
  className,
}: ProjectShowcaseCardProps) {
  const coverUrl = getProjectCoverUrl(project);
  const articleCount = project.category._count.articles;
  const accentColor = project.color ?? "var(--color-accent)";

  return (
    <article
      className={cn(
        "group w-full border-b border-gray-100 bg-white transition-colors hover:bg-bg-soft/20",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col lg:min-h-[26rem] lg:flex-row xl:min-h-[30rem]",
          imageOnRight && "lg:flex-row-reverse",
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:w-1/2 lg:min-h-[26rem] xl:min-h-[30rem]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={!imageOnRight}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}55 50%, ${accentColor}18 100%)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                  backgroundSize: "28px 28px",
                }}
                aria-hidden
              />
              <div className="flex h-full items-center justify-center">
                <span
                  className="text-7xl font-bold tracking-tight opacity-15 sm:text-8xl xl:text-9xl"
                  style={{ color: accentColor }}
                  aria-hidden
                >
                  {project.title.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 lg:py-12 xl:px-20 xl:py-16">
          <span
            className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            Projet
          </span>

          <h2 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl xl:text-4xl">
            <Link
              href={`/c/${project.slug}`}
              className="transition-colors hover:text-accent-dark"
            >
              {project.title}
            </Link>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary/75 sm:text-lg">
            {project.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href={`/c/${project.slug}`}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Voir les articles
              {articleCount > 0 ? (
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-medium">
                  {articleCount}
                </span>
              ) : null}
            </Link>

            {project.donationUrl ? (
              <a
                href={project.donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary/60 transition-colors hover:text-accent-dark hover:underline"
              >
                Soutenir ce projet →
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
