"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  articleMatchesQuery,
  type HelpArticle,
} from "@/lib/help-content";
import { cn } from "@/lib/utils";

type HelpWikiProps = {
  title: string;
  description: string;
  articles: HelpArticle[];
  audienceLabel: string;
};

export function HelpWiki({ title, description, articles, audienceLabel }: HelpWikiProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(articles[0]?.id ?? null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const shouldScrollOpenCard = useRef(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!openId || !shouldScrollOpenCard.current) return;
    shouldScrollOpenCard.current = false;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const card = cardRefs.current.get(openId);
        if (!card) return;

        const header = document.querySelector<HTMLElement>("header.sticky");
        const headerHeight = header?.offsetHeight ?? 0;
        const gap = 16;
        const top =
          window.scrollY + card.getBoundingClientRect().top - headerHeight - gap;

        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [openId]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const article of articles) {
      if (!seen.has(article.category)) {
        seen.add(article.category);
        list.push(article.category);
      }
    }
    return list;
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (activeCategory && article.category !== activeCategory) return false;
      return articleMatchesQuery(article, deferredQuery);
    });
  }, [articles, activeCategory, deferredQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, HelpArticle[]>();
    for (const article of filtered) {
      const list = map.get(article.category) ?? [];
      list.push(article);
      map.set(article.category, list);
    }
    return categories
      .filter((category) => map.has(category))
      .map((category) => ({
        category,
        articles: map.get(category)!,
      }));
  }, [filtered, categories]);

  const resultCount = filtered.length;

  return (
    <div className="container-meeed py-10">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-dark">
          {audienceLabel}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-primary-dark">{title}</h1>
        <p className="mt-2 text-primary/70">{description}</p>
      </div>

      <div className="mt-8 -mx-1 px-1 py-3">
        <label htmlFor="help-search" className="sr-only">
          Rechercher dans l&apos;aide
        </label>
        <div className="relative max-w-xl">
          <span
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary/40"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une fonctionnalité (ex. publier, PDF, forum…)"
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-primary shadow-sm placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            data-tour-id="admin.aide.search"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <CategoryChip
            label="Toutes les catégories"
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              active={activeCategory === category}
              onClick={() =>
                setActiveCategory((current) => (current === category ? null : category))
              }
            />
          ))}
        </div>

        <p className="mt-2 text-xs text-primary/50" aria-live="polite">
          {resultCount === 0
            ? "Aucun résultat"
            : `${resultCount} fiche${resultCount > 1 ? "s" : ""}`}
          {deferredQuery.trim() ? ` pour « ${deferredQuery.trim()} »` : ""}
        </p>
      </div>

      {grouped.length === 0 ? (
        <Card className="mt-6 max-w-xl hover:shadow-sm">
          <p className="font-medium text-primary-dark">Aucun résultat</p>
          <p className="mt-1 text-sm text-primary/65">
            Essayez un autre mot-clé, ou effacez la recherche pour parcourir toutes les fiches.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQuery("");
              setActiveCategory(null);
            }}
          >
            Réinitialiser
          </Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-8">
          {grouped.map((group) => (
            <section key={group.category} aria-labelledby={`help-cat-${group.category}`}>
              <h2
                id={`help-cat-${group.category}`}
                className="font-heading text-sm font-bold tracking-wide text-primary-dark"
              >
                {group.category}
              </h2>
              <div className="mt-3 space-y-3">
                {group.articles.map((article) => {
                  const isOpen = openId === article.id;
                  return (
                    <div
                      key={article.id}
                      ref={(node) => {
                        if (node) {
                          cardRefs.current.set(article.id, node);
                        } else {
                          cardRefs.current.delete(article.id);
                        }
                      }}
                      data-tour-id="admin.aide.card"
                    >
                    <Card
                      className={cn("p-0 hover:shadow-sm", isOpen && "ring-1 ring-accent/30")}
                    >
                      <div className="flex items-start justify-between gap-4 px-5 py-4">
                        <div className="min-w-0">
                          <h3 className="block font-semibold text-primary-dark">{article.title}</h3>
                          <p className="mt-1 text-sm text-primary/65">{article.summary}</p>
                        </div>
                        <Button
                          type="button"
                          variant={isOpen ? "ghost" : "outline"}
                          className="shrink-0 px-4 py-2 text-xs"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenId((current) => {
                              if (current === article.id) return null;
                              shouldScrollOpenCard.current = true;
                              return article.id;
                            })
                          }
                        >
                          {isOpen ? "Fermer" : "Lire"}
                        </Button>
                      </div>

                      {isOpen ? (
                        <div className="border-t border-gray-100 px-5 py-4">
                          {article.steps && article.steps.length > 0 ? (
                            <div>
                              <h3 className="text-sm font-semibold text-primary-dark">
                                Étapes
                              </h3>
                              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-primary/75">
                                {article.steps.map((step) => (
                                  <li key={step}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          ) : null}

                          {article.tips && article.tips.length > 0 ? (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                              <p className="font-semibold">Conseils</p>
                              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                                {article.tips.map((tip) => (
                                  <li key={tip}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {article.links && article.links.length > 0 ? (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {article.links.map((link) => {
                                const isExternal = /^https?:\/\//i.test(link.href);
                                return (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    {...(isExternal
                                      ? { target: "_blank", rel: "noopener noreferrer" }
                                      : {})}
                                    className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-accent-dark transition-colors hover:border-accent hover:bg-bg-soft"
                                  >
                                    {link.label} →
                                  </Link>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </Card>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent-dark"
          : "border-gray-200 bg-white text-primary/65 hover:border-gray-300 hover:text-primary-dark",
      )}
    >
      {label}
    </button>
  );
}
