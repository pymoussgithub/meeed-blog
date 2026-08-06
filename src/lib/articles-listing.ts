import type { PublicArticleFilters } from "@/lib/services/article.service";

type ArticleListingSource = {
  categories: Array<{
    category: {
      id?: string;
      name: string;
      slug?: string;
    };
  }>;
};

export type ArticlesListingParams = PublicArticleFilters & {
  q?: string | null;
  page?: number | null;
};

export function parseArticlesListingParams(
  params: Record<string, string | undefined>,
): ArticlesListingParams {
  const contentType =
    params.type === "news" || params.type === "formation"
      ? params.type
      : null;

  return {
    q: params.q?.trim() || null,
    categorySlug: params.category?.trim() || null,
    authorId: params.author?.trim() || null,
    dateFrom: params.from?.trim() || null,
    dateTo: params.to?.trim() || null,
    contentType,
    page: Math.max(1, Number(params.page ?? "1")),
  };
}

export function buildArticlesUrl(
  current: ArticlesListingParams,
  overrides: Partial<ArticlesListingParams> = {},
): string {
  const next = { ...current, ...overrides, page: overrides.page ?? null };

  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.contentType) search.set("type", next.contentType);
  if (next.categorySlug) search.set("category", next.categorySlug);
  if (next.authorId) search.set("author", next.authorId);
  if (next.dateFrom) search.set("from", next.dateFrom);
  if (next.dateTo) search.set("to", next.dateTo);
  if (next.page && next.page > 1) search.set("page", String(next.page));

  const query = search.toString();
  return query ? `/actualites?${query}` : "/actualites";
}

export function buildArticlesCurrentUrl(params: ArticlesListingParams): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.contentType) search.set("type", params.contentType);
  if (params.categorySlug) search.set("category", params.categorySlug);
  if (params.authorId) search.set("author", params.authorId);
  if (params.dateFrom) search.set("from", params.dateFrom);
  if (params.dateTo) search.set("to", params.dateTo);
  if (params.page && params.page > 1) search.set("page", String(params.page));

  const query = search.toString();
  return query ? `/actualites?${query}` : "/actualites";
}

export function hasActiveListingFilters(params: ArticlesListingParams): boolean {
  return Boolean(
    params.q ||
      params.categorySlug ||
      params.authorId ||
      params.dateFrom ||
      params.dateTo ||
      params.contentType,
  );
}

export function listingParamsToPublicFilters(
  params: ArticlesListingParams,
): PublicArticleFilters & { search?: string | null } {
  return {
    search: params.q,
    categorySlug: params.categorySlug,
    authorId: params.authorId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    contentType: params.contentType,
  };
}

export function listingParamsToPaginationQuery(params: ArticlesListingParams) {
  return {
    q: params.q ?? undefined,
    type: params.contentType ?? undefined,
    category: params.categorySlug ?? undefined,
    author: params.authorId ?? undefined,
    from: params.dateFrom ?? undefined,
    to: params.dateTo ?? undefined,
  };
}

export type ArticleKind = "news";

export function getArticleKind(_article: ArticleListingSource): ArticleKind {
  return "news";
}

export function getNewsCategories(article: ArticleListingSource) {
  return article.categories
    .map(({ category }) => category)
    ;
}
