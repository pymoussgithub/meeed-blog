"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CarouselArticle } from "@/lib/article-carousel";
import { cn, formatDate } from "@/lib/utils";

const VISIBLE = 3;
const SLIDE_MS = 280;

type NewsArticlesCarouselStripProps = {
  articles: CarouselArticle[];
  returnTo?: string;
  label?: string;
};

type SlideDir = "prev" | "next";
type SlideStage = "idle" | "exit" | "enter";

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d={direction === "left" ? "M14.5 5.5 8 12l6.5 6.5" : "M9.5 5.5 16 12l-6.5 6.5"}
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowButton({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full",
        "bg-white/95 text-primary shadow-[0_8px_24px_rgba(41,47,54,0.18)] ring-1 ring-black/5",
        "backdrop-blur-md transition-all duration-200",
        "hover:scale-105 hover:bg-white hover:text-accent-dark hover:shadow-[0_10px_28px_rgba(41,47,54,0.22)]",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        direction === "left" ? "left-3" : "right-3",
        disabled && "pointer-events-none opacity-0",
      )}
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function NewsCarouselCard({
  article,
  returnTo,
  showPrev,
  showNext,
  canPrev,
  canNext,
  onPrev,
  onNext,
  prevLabel = "Articles précédents",
  nextLabel = "Articles suivants",
}: {
  article: CarouselArticle;
  returnTo?: string;
  showPrev?: boolean;
  showNext?: boolean;
  canPrev?: boolean;
  canNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
}) {
  const href = returnTo
    ? `/a/${article.slug}?returnTo=${encodeURIComponent(returnTo)}`
    : `/a/${article.slug}`;
  const publishedAt = article.publishedAt ? new Date(article.publishedAt) : null;

  return (
    <article
      data-tour-id="articles.list.card"
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-accent/25 bg-white ring-1 ring-accent/10 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden bg-bg-soft">
        <Link href={href} className="absolute inset-0 block">
          {article.coverUrl ? (
            <Image
              src={article.coverUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs font-semibold text-primary/25">
              MEEED
            </div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
          {article.project ? (
            <span
              className="inline-flex max-w-full truncate rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
              style={{ backgroundColor: article.project.color ?? "var(--color-accent-dark)" }}
            >
              {article.project.title}
            </span>
          ) : (
            <span className="inline-flex max-w-full truncate rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {article.categoryLabel}
            </span>
          )}
        </div>

        {showPrev && onPrev ? (
          <ArrowButton
            direction="left"
            onClick={onPrev}
            disabled={!canPrev}
            label={prevLabel}
          />
        ) : null}

        {showNext && onNext ? (
          <ArrowButton
            direction="right"
            onClick={onNext}
            disabled={!canNext}
            label={nextLabel}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {publishedAt ? (
          <time dateTime={publishedAt.toISOString()} className="text-[11px] text-primary/45">
            {formatDate(publishedAt)}
          </time>
        ) : null}

        <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-snug">
          <Link href={href} className="transition-colors hover:text-accent-dark">
            {article.title}
          </Link>
        </h2>

        {article.excerpt ? (
          <p className="mt-1.5 text-xs leading-relaxed text-primary/60 sm:text-sm">
            {article.excerpt}
          </p>
        ) : null}

        {article.authorName ? (
          <p className="mt-auto pt-2 text-[11px] text-primary/40">{article.authorName}</p>
        ) : null}
      </div>
    </article>
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function NewsArticlesCarouselStrip({
  articles,
  returnTo,
  label = "Articles",
}: NewsArticlesCarouselStripProps) {
  const [start, setStart] = useState(0);
  const [dir, setDir] = useState<SlideDir>("next");
  const [stage, setStage] = useState<SlideStage>("idle");
  const locked = useRef(false);

  const count = articles.length;
  const maxStart = Math.max(0, count - VISIBLE);
  const canPrev = start > 0;
  const canNext = start < maxStart;
  const showArrows = count > VISIBLE;

  const navigate = useCallback(
    async (direction: SlideDir) => {
      if (locked.current) return;
      if (direction === "prev" && !canPrev) return;
      if (direction === "next" && !canNext) return;

      locked.current = true;
      setDir(direction);
      setStage("exit");
      await wait(SLIDE_MS);

      setStart((current) =>
        direction === "next"
          ? Math.min(maxStart, current + 1)
          : Math.max(0, current - 1),
      );
      setStage("enter");

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setStage("idle");
            resolve();
          });
        });
      });

      await wait(SLIDE_MS);
      locked.current = false;
    },
    [canNext, canPrev, maxStart],
  );

  useEffect(() => {
    setStart((current) => Math.min(current, maxStart));
  }, [maxStart]);

  if (count === 0) return null;

  const visible = articles.slice(start, start + VISIBLE);
  const lastIndex = visible.length - 1;

  const motionClass =
    stage === "exit"
      ? dir === "next"
        ? "-translate-x-8 opacity-0"
        : "translate-x-8 opacity-0"
      : stage === "enter"
        ? dir === "next"
          ? "translate-x-8 opacity-0"
          : "-translate-x-8 opacity-0"
        : "translate-x-0 opacity-100";

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4",
          "ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          motionClass,
        )}
        style={{
          transitionProperty: stage === "enter" ? "none" : "transform, opacity",
          transitionDuration: `${SLIDE_MS}ms`,
        }}
      >
        {visible.map((article, index) => (
          <div
            key={`${start}-${article.id}`}
            className="min-w-0"
            aria-roledescription="slide"
            aria-label={`${start + index + 1} sur ${count}`}
          >
            <NewsCarouselCard
              article={article}
              returnTo={returnTo}
              showPrev={showArrows && index === 0}
              showNext={showArrows && index === lastIndex}
              canPrev={canPrev}
              canNext={canNext}
              onPrev={() => void navigate("prev")}
              onNext={() => void navigate("next")}
              prevLabel={`${label} précédents`}
              nextLabel={`${label} suivants`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
