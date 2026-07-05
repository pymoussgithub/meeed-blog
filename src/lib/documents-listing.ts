import type { PublicDocumentFilters } from "@/lib/services/document.service";

export type DocumentsListingParams = PublicDocumentFilters & {
  q?: string | null;
};

export function parseDocumentsListingParams(
  params: Record<string, string | undefined>,
): DocumentsListingParams {
  const linked =
    params.linked === "yes" || params.linked === "no" ? params.linked : null;

  return {
    q: params.q?.trim() || null,
    projectSlug: params.project?.trim() || null,
    categorySlug: params.category?.trim() || null,
    uploaderId: params.user?.trim() || null,
    dateFrom: params.from?.trim() || null,
    dateTo: params.to?.trim() || null,
    linked,
  };
}

export function buildDocumentsUrl(
  current: DocumentsListingParams,
  overrides: Partial<DocumentsListingParams> = {},
): string {
  const next = { ...current, ...overrides };

  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.projectSlug) search.set("project", next.projectSlug);
  if (next.categorySlug) search.set("category", next.categorySlug);
  if (next.uploaderId) search.set("user", next.uploaderId);
  if (next.dateFrom) search.set("from", next.dateFrom);
  if (next.dateTo) search.set("to", next.dateTo);
  if (next.linked) search.set("linked", next.linked);

  const query = search.toString();
  return query ? `/documents?${query}` : "/documents";
}

export function hasActiveDocumentFilters(params: DocumentsListingParams): boolean {
  return Boolean(
    params.q ||
      params.projectSlug ||
      params.categorySlug ||
      params.uploaderId ||
      params.dateFrom ||
      params.dateTo ||
      params.linked,
  );
}

export function listingParamsToDocumentFilters(
  params: DocumentsListingParams,
): PublicDocumentFilters {
  return {
    search: params.q,
    projectSlug: params.projectSlug,
    categorySlug: params.categorySlug,
    uploaderId: params.uploaderId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    linked: params.linked,
  };
}

export type DocumentWithArticleRelations = {
  article?: {
    id: string;
    title: string;
    slug: string;
    categories: Array<{
      category: {
        id: string;
        name: string;
        slug: string;
        project: { id: string; title: string; slug: string } | null;
      };
    }>;
  } | null;
};

export function getDocumentProject(document: DocumentWithArticleRelations) {
  if (!document.article) return null;

  for (const { category } of document.article.categories) {
    if (category.project) {
      return category.project;
    }
  }

  return null;
}

export function getDocumentNewsCategories(document: DocumentWithArticleRelations) {
  if (!document.article) return [];

  return document.article.categories
    .map(({ category }) => category)
    .filter((category) => !category.project);
}
