import type { PublicDocumentFilters } from "@/lib/services/document.service";

export type DocumentsListingParams = PublicDocumentFilters & {
  q?: string | null;
};

export function parseDocumentsListingParams(
  params: Record<string, string | undefined>,
): DocumentsListingParams {
  const linked =
    params.linked === "article" || params.linked === "no"
      ? params.linked
      : null;

  return {
    q: params.q?.trim() || null,
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
    categorySlug: params.categorySlug,
    uploaderId: params.uploaderId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    linked: params.linked,
  };
}

export type DocumentWithArticleRelations = {
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  article?: {
    id: string;
    title: string;
    slug: string;
    categories: Array<{
      category: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  } | null;
};

export function getDocumentNewsCategories(document: DocumentWithArticleRelations) {
  const fromArticle =
    document.article?.categories.map(({ category }) => category) ?? [];
  const direct = document.category ? [document.category] : [];

  const byId = new Map<string, { id: string; name: string; slug: string }>();
  for (const category of [...direct, ...fromArticle]) {
    byId.set(category.id, category);
  }

  return [...byId.values()];
}

export function getDocumentLinkLabel(document: DocumentWithArticleRelations) {
  const linkedToArticle = Boolean(document.article);
  if (linkedToArticle) {
    return "Lié à un article";
  }
  return "Document autonome";
}

export function isDocumentLinked(document: DocumentWithArticleRelations) {
  return Boolean(document.article);
}
