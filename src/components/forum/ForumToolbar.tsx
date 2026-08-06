import Link from "next/link";
import { ForumAdvancedSearch } from "@/components/forum/ForumAdvancedSearch";
import type { ForumBreadcrumbItem } from "@/components/forum/ForumBreadcrumb";
import type { ForumSearchFilters } from "@/lib/forum-search";
import { getForumSearchFacets } from "@/lib/services/forum-search.service";
import { cn } from "@/lib/utils";

type ForumToolbarProps = {
  /** @deprecated Fil d’Ariane retiré de l’UI — conservé pour compatibilité des pages */
  items?: ForumBreadcrumbItem[];
  /** Path courant (compat) */
  activePath?: string;
  /** Lien du bouton retour (ex. /forum) — affiché uniquement s’il est fourni */
  backHref?: string;
  backLabel?: string;
  newTopicHref?: string;
  searchFilters?: ForumSearchFilters;
  showSearch?: boolean;
  className?: string;
};

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export async function ForumToolbar({
  backHref,
  backLabel = "Retour",
  newTopicHref = "/forum/nouveau",
  searchFilters,
  showSearch = true,
  className,
}: ForumToolbarProps) {
  const facets = showSearch ? await getForumSearchFacets().catch(() => null) : null;

  return (
    <div className={cn("mb-4 border-b border-primary/10 pb-3", className)}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="justify-self-start md:col-start-1">
          {backHref ? (
            <Link
              href={backHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary/15 bg-white px-3 text-sm font-semibold text-primary shadow-sm transition-all hover:border-accent/50 hover:bg-bg-soft/60 hover:text-accent-dark"
            >
              <BackIcon className="h-3.5 w-3.5 shrink-0 text-accent-dark" />
              {backLabel}
            </Link>
          ) : null}
        </div>

        <div className="justify-self-start md:col-start-2 md:justify-self-center">
          {showSearch && facets ? (
            <ForumAdvancedSearch
              categories={facets.categories}
              authors={facets.authors}
              initialFilters={searchFilters}
            />
          ) : null}
        </div>

        <div className="col-start-2 justify-self-end md:col-start-3">
          <Link
            href={newTopicHref}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white shadow-sm shadow-accent/25 transition-all hover:bg-accent-dark hover:shadow-md hover:shadow-accent/30"
            data-tour-id="forum.new-topic"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
            <span className="hidden sm:inline">Nouveau sujet</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
