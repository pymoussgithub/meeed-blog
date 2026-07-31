import type { PublicDocumentFilters } from "@/lib/services/document.service";

export type DocumentsListingParams = PublicDocumentFilters & {
  q?: string | null;
};

export function parseDocumentsListingParams(
  params: Record<string, string | undefined>,
): DocumentsListingParams {
  const linked =
    params.linked === "article" || params.linked === "project" || params.linked === "no"
      ? params.linked
      : null;

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
  return countDocumentFilters(params) > 0;
}

export function countDocumentFilters(params: DocumentsListingParams): number {
  let count = 0;
  if (params.q) count += 1;
  if (params.projectSlug) count += 1;
  if (params.categorySlug) count += 1;
  if (params.uploaderId) count += 1;
  if (params.dateFrom) count += 1;
  if (params.dateTo) count += 1;
  if (params.linked) count += 1;
  return count;
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
  project?: {
    id: string;
    title: string;
    slug: string;
    category: { slug: string };
  } | null;
  article?: {
    id: string;
    title: string;
    slug: string;
    project?: {
      id: string;
      title: string;
      slug: string;
      isActive?: boolean;
      category: { slug: string };
    } | null;
    categories: Array<{
      category: {
        id: string;
        name: string;
        slug: string;
        projects: Array<{ id: string }>;
      };
    }>;
  } | null;
};

export function getDocumentProject(document: DocumentWithArticleRelations) {
  if (document.project) {
    return document.project;
  }

  if (!document.article) return null;

  if (document.article.project) {
    return document.article.project;
  }

  return null;
}

export function getDocumentNewsCategories(document: DocumentWithArticleRelations) {
  if (!document.article) return [];

  return document.article.categories
    .map(({ category }) => category)
    .filter((category) => category.projects.length === 0);
}

export function getDocumentLinkLabel(document: DocumentWithArticleRelations) {
  const linkedToArticle = Boolean(document.article);
  const linkedToProject = Boolean(document.project);

  if (linkedToArticle && linkedToProject) {
    return "Lié à un article et un projet";
  }
  if (linkedToArticle) {
    return "Lié à un article";
  }
  if (linkedToProject) {
    return "Lié à un projet";
  }
  return "Document autonome";
}

export function isDocumentLinked(document: DocumentWithArticleRelations) {
  return Boolean(document.article || document.project);
}
