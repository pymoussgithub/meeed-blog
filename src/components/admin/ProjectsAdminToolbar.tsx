"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ProjectsAdminToolbarProps = {
  stats: {
    total: number;
    active: number;
    hidden: number;
  };
};

const VISIBILITY_TABS = [
  { value: "", label: "Tous", countKey: "total" as const },
  { value: "active", label: "Visibles", countKey: "active" as const },
  { value: "hidden", label: "Masqués", countKey: "hidden" as const },
];

export function ProjectsAdminToolbar({ stats }: ProjectsAdminToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentVisibility = searchParams.get("visibility") ?? "";
  const currentQuery = searchParams.get("q") ?? "";

  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      const query = params.toString();
      return query ? `/admin/projets?${query}` : "/admin/projets";
    },
    [searchParams],
  );

  const hasActiveFilters = Boolean(currentVisibility || currentQuery);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {VISIBILITY_TABS.map((tab) => {
          const isActive = currentVisibility === tab.value;
          const count = stats[tab.countKey];

          return (
            <Link
              key={tab.value || "all"}
              href={buildUrl({ visibility: tab.value || null })}
              className={cn(
                "rounded-xl border bg-white p-4 transition-all hover:shadow-sm",
                isActive
                  ? "border-accent ring-1 ring-accent/20"
                  : "border-gray-200 hover:border-gray-300",
              )}
            >
              <p className="text-sm text-primary/60">{tab.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary-dark">{count}</p>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="min-w-0 flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const query = String(formData.get("q") ?? "").trim();
            router.push(buildUrl({ q: query || null }));
          }}
        >
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Rechercher un projet…"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-primary-dark placeholder:text-primary/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <Button type="submit" variant="outline" className="shrink-0">
              Rechercher
            </Button>
          </div>
        </form>

        {hasActiveFilters ? (
          <Button href="/admin/projets" variant="outline">
            Réinitialiser
          </Button>
        ) : null}
      </div>
    </div>
  );
}
