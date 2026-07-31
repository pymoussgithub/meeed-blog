"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

export type LinkedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
};

type LinkedArticlesCarouselProps = {
  articles: LinkedArticle[];
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  );
}

export function LinkedArticlesCarousel({ articles }: LinkedArticlesCarouselProps) {
  const [index, setIndex] = useState(0);
  const count = articles.length;
  const showControls = count > 1;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Articles de référence"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2
          id="forum-linked-articles"
          className="text-xs font-semibold uppercase tracking-wide text-accent-dark"
        >
          Article{count > 1 ? "s" : ""} de référence
          {showControls ? (
            <span className="ml-1.5 font-medium normal-case tracking-normal text-primary/40">
              {index + 1}/{count}
            </span>
          ) : null}
        </h2>

        {showControls ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/10 bg-white text-primary/60 transition-colors hover:border-accent/40 hover:text-accent-dark"
              aria-label="Article précédent"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/10 bg-white text-primary/60 transition-colors hover:border-accent/40 hover:text-accent-dark"
              aria-label="Article suivant"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
          aria-live="polite"
        >
          {articles.map((article, slideIndex) => (
            <div
              key={article.id}
              className="w-full shrink-0 grow-0 basis-full"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} sur ${count}`}
              aria-hidden={slideIndex !== index}
            >
              <Link
                href={`/a/${article.slug}`}
                tabIndex={slideIndex === index ? 0 : -1}
                className="group flex overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
              >
                <div className="relative w-24 shrink-0 self-stretch min-h-[5.5rem] bg-bg-soft sm:w-28">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="112px"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/30 to-bg-soft"
                      aria-hidden="true"
                    >
                      <span className="font-heading text-lg font-bold text-accent-dark/70">
                        M
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3 py-3 sm:px-4">
                  <p className="font-heading text-sm font-semibold text-primary-dark transition-colors group-hover:text-accent-dark sm:text-base">
                    {article.title}
                  </p>
                  {article.excerpt ? (
                    <p className="line-clamp-2 text-xs leading-relaxed text-primary/55">
                      {article.excerpt}
                    </p>
                  ) : null}
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-accent-dark">
                    Lire l’article
                    <span
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {showControls ? (
        <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Pagination">
          {articles.map((article, dotIndex) => (
            <button
              key={article.id}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Afficher l’article ${dotIndex + 1}`}
              onClick={() => goTo(dotIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index
                  ? "w-4 bg-accent-dark"
                  : "w-1.5 bg-primary/20 hover:bg-primary/35",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
