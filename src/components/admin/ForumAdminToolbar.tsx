"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { FORUM_TOPIC_STATUS_LABELS } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
};

type ForumAdminToolbarProps = {
  tab: "sujets" | "messages";
  categories: CategoryOption[];
  stats: {
    total: number;
    open: number;
    locked: number;
    archived: number;
  };
};

const STATUS_TABS = [
  { value: "", label: "Tous", countKey: "total" as const },
  { value: "OPEN", label: "Ouverts", countKey: "open" as const },
  { value: "LOCKED", label: "Verrouillés", countKey: "locked" as const },
  { value: "ARCHIVED", label: "Archivés", countKey: "archived" as const },
];

export function ForumAdminToolbar({ tab, categories, stats }: ForumAdminToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentQuery = searchParams.get("q") ?? "";

  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      params.delete("page");
      params.delete("postsPage");
      params.delete("deleted");

      const query = params.toString();
      return query ? `/admin/forum?${query}` : "/admin/forum";
    },
    [searchParams],
  );

  const hasActiveFilters = Boolean(currentStatus || currentCategory || currentQuery);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildUrl({ tab: null, status: currentStatus || null })}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            tab === "sujets"
              ? "bg-accent text-white"
              : "border border-gray-200 bg-white text-primary-dark hover:bg-bg-soft",
          )}
        >
          Discussions
        </Link>
        <Link
          href={buildUrl({ tab: "messages", status: null, category: null })}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            tab === "messages"
              ? "bg-accent text-white"
              : "border border-gray-200 bg-white text-primary-dark hover:bg-bg-soft",
          )}
        >
          Messages
        </Link>
      </div>

      {tab === "sujets" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_TABS.map((statusTab) => {
            const isActive = currentStatus === statusTab.value;
            const count = stats[statusTab.countKey];

            return (
              <Link
                key={statusTab.value || "all"}
                href={buildUrl({ status: statusTab.value || null })}
                className={cn(
                  "rounded-xl border bg-white p-4 transition-all hover:shadow-sm",
                  isActive
                    ? "border-accent ring-1 ring-accent/20"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <p className="text-sm text-primary/60">{statusTab.label}</p>
                <p className="mt-1 text-2xl font-bold text-primary-dark">{count}</p>
              </Link>
            );
          })}
        </div>
      ) : null}

      <form
        method="get"
        className="rounded-xl border border-gray-200 bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          router.push(
            buildUrl({
              q: (formData.get("q") as string) || null,
              status: tab === "sujets" ? (formData.get("status") as string) || null : null,
              category:
                tab === "sujets" ? (formData.get("category") as string) || null : null,
              tab: tab === "messages" ? "messages" : null,
            }),
          );
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="forum-search" className="mb-1.5 block text-xs font-medium text-primary/70">
              Recherche
            </label>
            <input
              id="forum-search"
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder={
                tab === "messages" ? "Message, discussion, auteur…" : "Titre, slug…"
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {tab === "sujets" ? (
            <>
              <div className="w-full lg:w-44">
                <label
                  htmlFor="forum-status"
                  className="mb-1.5 block text-xs font-medium text-primary/70"
                >
                  Statut
                </label>
                <select
                  id="forum-status"
                  name="status"
                  defaultValue={currentStatus}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Tous les statuts</option>
                  <option value="OPEN">Ouverts</option>
                  <option value="LOCKED">Verrouillés</option>
                  <option value="ARCHIVED">Archivés</option>
                </select>
              </div>

              <div className="w-full lg:w-52">
                <label
                  htmlFor="forum-category"
                  className="mb-1.5 block text-xs font-medium text-primary/70"
                >
                  Rubrique
                </label>
                <select
                  id="forum-category"
                  name="category"
                  defaultValue={currentCategory}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                >
                  <option value="">Toutes les rubriques</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" variant="accent">
              Filtrer
            </Button>
            {hasActiveFilters ? (
              <Button
                href={tab === "messages" ? "/admin/forum?tab=messages" : "/admin/forum"}
                variant="ghost"
              >
                Effacer
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-primary/60">Filtres actifs :</span>
          {currentQuery ? (
            <FilterChip label={`« ${currentQuery} »`} href={buildUrl({ q: null })} />
          ) : null}
          {currentStatus ? (
            <FilterChip
              label={FORUM_TOPIC_STATUS_LABELS[currentStatus] ?? currentStatus}
              href={buildUrl({ status: null })}
            />
          ) : null}
          {currentCategory ? (
            <FilterChip
              label={categories.find((c) => c.id === currentCategory)?.name ?? "Rubrique"}
              href={buildUrl({ category: null })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-full bg-bg-soft px-3 py-1 text-xs font-medium text-accent-dark hover:bg-accent/20"
    >
      {label}
      <span aria-hidden>×</span>
    </Link>
  );
}
