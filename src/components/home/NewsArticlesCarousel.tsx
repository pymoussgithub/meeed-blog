"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CarouselArticle } from "@/lib/article-carousel";
import { cn, formatDate } from "@/lib/utils";

type NewsArticlesCarouselProps = {
  articles: CarouselArticle[];
};

const AUTO_PLAY_MS = 6000;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-4 w-4"
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

export function NewsArticlesCarousel({ articles }: NewsArticlesCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = articles.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev]);

  if (count === 0) {
    return (
      <div className="relative mx-auto w-full max-w-[26.46rem] sm:max-w-[30.87rem] lg:ml-auto lg:max-w-[26.46rem]">
        <div
          className="absolute -inset-2 rounded-3xl bg-linear-to-tr from-accent/25 to-accent-blue/15 sm:-inset-3"
          aria-hidden
        />
        <div className="relative rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-xl ring-1 ring-black/5">
          <p className="text-sm text-primary/60">Aucune actualité publiée pour le moment.</p>
          <Link
            href="/actualites"
            className="mt-3 inline-flex text-sm font-semibold text-accent-dark transition-colors hover:text-accent"
          >
            Voir la rubrique actualités
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[26.46rem] sm:max-w-[30.87rem] lg:ml-auto lg:max-w-[26.46rem]"
      role="region"
      aria-label="Actualités récentes"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="absolute -inset-2 rounded-3xl bg-linear-to-tr from-accent/25 to-accent-blue/15 sm:-inset-3"
        aria-hidden
      />

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
          <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-accent-dark">
            Actualités
          </span>
          <Link
            href="/actualites"
            className="text-xs font-semibold text-accent-dark transition-colors hover:text-accent"
          >
            Tout voir
          </Link>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-live="polite"
          >
            {articles.map((article) => {
              const href = `/a/${article.slug}`;
              const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null;

              return (
                <article key={article.id} className="w-full shrink-0" aria-roledescription="slide">
                  <Link href={href} className="group flex gap-3.5 p-3.5 sm:gap-4 sm:p-4">
                    <div className="relative h-[6.615rem] w-[6.615rem] shrink-0 overflow-hidden rounded-xl bg-bg-soft p-2 sm:h-[7.7175rem] sm:w-[7.7175rem] sm:p-2.5">
                      {article.coverUrl ? (
                        <Image
                          src={article.coverUrl}
                          alt=""
                          fill
                          className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="7.72rem"
                          priority={article.id === articles[0]?.id}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-medium text-primary/30">
                          MEEED
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="inline-flex items-center rounded-md bg-primary/90 px-2 py-0.5 text-[0.65rem] font-semibold text-white sm:text-xs">
                          {article.categoryLabel}
                        </span>
                        {publishedAt ? (
                          <time
                            dateTime={publishedAt.toISOString()}
                            className="text-xs text-primary/50"
                          >
                            {formatDate(publishedAt)}
                          </time>
                        ) : null}
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold leading-snug text-primary-dark transition-colors group-hover:text-accent-dark sm:text-base line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-primary/70 sm:text-sm line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {count > 1 ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2.5 sm:px-4">
            <div className="flex gap-1.5">
              {articles.map((article, dotIndex) => (
                <button
                  key={article.id}
                  type="button"
                  aria-label={`Aller à l'actualité ${dotIndex + 1}`}
                  aria-current={dotIndex === index ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    dotIndex === index
                      ? "w-6 bg-accent"
                      : "w-2 bg-gray-300 hover:bg-accent/50",
                  )}
                  onClick={() => goTo(dotIndex)}
                />
              ))}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                aria-label="Actualité précédente"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-primary transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
                onClick={goPrev}
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                aria-label="Actualité suivante"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-primary transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent-dark"
                onClick={goNext}
              >
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
