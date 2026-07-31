import Link from "next/link";
import { DocumentsAdvancedSearch } from "@/components/documents/DocumentsAdvancedSearch";
import type { DocumentsListingParams } from "@/lib/documents-listing";
import { cn } from "@/lib/utils";

type FilterOption = { id: string; label: string; slug?: string };

type DocumentsToolbarProps = {
  params: DocumentsListingParams;
  projects: FilterOption[];
  categories: FilterOption[];
  uploaders: FilterOption[];
  newDocumentHref?: string;
  canAddDocument?: boolean;
  className?: string;
};

export function DocumentsToolbar({
  params,
  projects,
  categories,
  uploaders,
  newDocumentHref = "/admin/documents",
  canAddDocument = false,
  className,
}: DocumentsToolbarProps) {
  return (
    <div className={cn("mb-4 border-b border-primary/10 pb-3", className)}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="justify-self-start md:col-start-1" />

        <div className="justify-self-start md:col-start-2 md:justify-self-center">
          <DocumentsAdvancedSearch
            params={params}
            projects={projects}
            categories={categories}
            uploaders={uploaders}
          />
        </div>

        <div className="col-start-2 justify-self-end md:col-start-3">
          {canAddDocument ? (
            <Link
              href={newDocumentHref}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-white shadow-sm shadow-accent/25 transition-all hover:bg-accent-dark hover:shadow-md hover:shadow-accent/30"
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
              <span className="hidden sm:inline">Nouveau document</span>
              <span className="sm:hidden">Nouveau</span>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
