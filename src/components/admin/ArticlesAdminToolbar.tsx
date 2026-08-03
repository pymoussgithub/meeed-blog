"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ProjectOption = {
  id: string;
  title: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type AuthorOption = {
  id: string;
  name: string;
};

type ArticlesAdminToolbarProps = {
  projects: ProjectOption[];
  categories: CategoryOption[];
  authors?: AuthorOption[];
  currentUserId?: string;
  stats: {
    total: number;
    published: number;
    drafts: number;
    archived: number;
  };
  isAdmin: boolean;
};

const STATUS_TABS = [
  { value: "", label: "Tous", countKey: "total" as const },
  { value: "DRAFT", label: "Brouillons", countKey: "drafts" as const },
  { value: "PUBLISHED", label: "Publiés", countKey: "published" as const },
  { value: "ARCHIVED", label: "Archivés", countKey: "archived" as const },
];

export function ArticlesAdminToolbar({
  projects,
  categories,
  authors = [],
  currentUserId,
  stats,
  isAdmin,
}: ArticlesAdminToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") ?? "";
  const currentProject = searchParams.get("project") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentAuthor = searchParams.get("author") ?? "";
  const currentQuery = searchParams.get("q") ?? "";

  const buildUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });

      params.delete("page");

      const query = params.toString();
      return query ? `/admin/articles?${query}` : "/admin/articles";
    },
    [searchParams],
  );

  const hasActiveFilters = Boolean(
    currentStatus || currentProject || currentCategory || currentAuthor || currentQuery,
  );

  const sortedAuthors = [...authors].sort((a, b) => {
    if (currentUserId && a.id === currentUserId) return -1;
    if (currentUserId && b.id === currentUserId) return 1;
    return a.name.localeCompare(b.name, "fr");
  });

  const selectedAuthor = authors.find((author) => author.id === currentAuthor);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATUS_TABS.map((tab) => {
          const isActive = currentStatus === tab.value;
          const count = stats[tab.countKey];

          return (
            <Link
              key={tab.value || "all"}
              href={buildUrl({ status: tab.value || null })}
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

      <form
        method="get"
        className="rounded-xl border border-gray-200 bg-white p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          router.push(
            buildUrl({
              q: (formData.get("q") as string) || null,
              status: (formData.get("status") as string) || null,
              project: (formData.get("project") as string) || null,
              category: (formData.get("category") as string) || null,
              author: (formData.get("author") as string) || null,
            }),
          );
        }}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="article-search" className="mb-1.5 block text-xs font-medium text-primary/70">
              Recherche
            </label>
            <input
              id="article-search"
              type="search"
              name="q"
              defaultValue={currentQuery}
              placeholder="Titre, extrait…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="w-full lg:w-44">
            <label htmlFor="article-status" className="mb-1.5 block text-xs font-medium text-primary/70">
              Statut
            </label>
            <select
              id="article-status"
              name="status"
              defaultValue={currentStatus}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Tous les statuts</option>
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>

          <div className="w-full lg:w-52">
            <label htmlFor="article-project" className="mb-1.5 block text-xs font-medium text-primary/70">
              Projet
            </label>
            <select
              id="article-project"
              name="project"
              defaultValue={currentProject}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Tous les projets</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {isAdmin ? (
            <div className="w-full lg:w-52">
              <label htmlFor="article-author" className="mb-1.5 block text-xs font-medium text-primary/70">
                Auteur
              </label>
              <select
                id="article-author"
                name="author"
                defaultValue={currentAuthor}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">Tous les auteurs</option>
                {sortedAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.id === currentUserId ? `Moi (${author.name})` : author.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="w-full lg:w-52">
            <label htmlFor="article-category" className="mb-1.5 block text-xs font-medium text-primary/70">
              Catégories
            </label>
            <select
              id="article-category"
              name="category"
              defaultValue={currentCategory}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="accent">
              Filtrer
            </Button>
            {hasActiveFilters ? (
              <Button href="/admin/articles" variant="ghost">
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
              label={STATUS_TABS.find((tab) => tab.value === currentStatus)?.label ?? currentStatus}
              href={buildUrl({ status: null })}
            />
          ) : null}
          {currentProject ? (
            <FilterChip
              label={projects.find((p) => p.id === currentProject)?.title ?? "Projet"}
              href={buildUrl({ project: null })}
            />
          ) : null}
          {currentCategory ? (
            <FilterChip
              label={categories.find((c) => c.id === currentCategory)?.name ?? "Catégorie"}
              href={buildUrl({ category: null })}
            />
          ) : null}
          {currentAuthor ? (
            <FilterChip
              label={
                currentAuthor === currentUserId
                  ? `Moi (${selectedAuthor?.name ?? "moi"})`
                  : (selectedAuthor?.name ?? "Auteur")
              }
              href={buildUrl({ author: null })}
            />
          ) : null}
        </div>
      ) : null}

      {!isAdmin ? (
        <p className="text-sm text-primary/60">
          Vous ne voyez ici que vos propres articles. Les administrateurs ont accès à l’ensemble du contenu.
        </p>
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
