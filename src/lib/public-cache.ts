import { unstable_cache } from "next/cache";
import {
  countFilteredPublishedArticles,
  getFilteredPublishedArticlesForListing,
  getPublishedArticleAuthors,
  type PublicArticleFilters,
} from "@/lib/services/article.service";
import {
  getAllCategories,
  getCategoriesWithPublishedCounts,
} from "@/lib/services/category.service";

/** TTL court pour les listes publiques (navigation soft quasi instantanée). */
export const PUBLIC_REVALIDATE_SECONDS = 60;

/** En `next dev`, le Data Cache Next peut servir d’anciens articles après un wipe DB. */
const skipDataCache = process.env.NODE_ENV === "development";

function cachedQuery<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: { revalidate: number; tags: string[] },
): () => Promise<T> {
  if (skipDataCache) return fn;
  return unstable_cache(fn, keyParts, options);
}

/** Tags pour invalider le cache public après édition d’articles / domaines. */
export const PUBLIC_CACHE_TAGS = {
  homeNews: "public-home-news",
  allCategories: "public-all-categories",
  categoriesWithCounts: "public-categories-with-counts",
  articleAuthors: "public-article-authors",
  actualitesListing: "public-actualites-listing",
} as const;

const ACTUALITES_FETCH_LIMIT = 200;

function filtersCacheKey(filters: PublicArticleFilters): string {
  return JSON.stringify({
    search: filters.search ?? null,
    categorySlug: filters.categorySlug ?? null,
    authorId: filters.authorId ?? null,
    dateFrom: filters.dateFrom ?? null,
    dateTo: filters.dateTo ?? null,
    contentType: filters.contentType ?? null,
    excludeArticleIds: filters.excludeArticleIds ?? null,
  });
}

export const getCachedHomeNews = cachedQuery(
  async () => getFilteredPublishedArticlesForListing({ contentType: "news" }, 6, 0),
  ["public-home-news"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.homeNews, PUBLIC_CACHE_TAGS.actualitesListing],
  },
);

export const getCachedAllCategories = cachedQuery(
  async () => getAllCategories(),
  ["public-all-categories"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.allCategories],
  },
);

export const getCachedCategoriesWithPublishedCounts = cachedQuery(
  async () => getCategoriesWithPublishedCounts(),
  ["public-categories-with-counts"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.categoriesWithCounts, PUBLIC_CACHE_TAGS.allCategories],
  },
);

export const getCachedPublishedArticleAuthors = cachedQuery(
  async () => getPublishedArticleAuthors(),
  ["public-article-authors"],
  {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.articleAuthors],
  },
);

export async function getCachedActualitesListing(filters: PublicArticleFilters) {
  const key = filtersCacheKey(filters);
  return cachedQuery(
    async () => {
      const [total, articles] = await Promise.all([
        countFilteredPublishedArticles(filters),
        getFilteredPublishedArticlesForListing(filters, ACTUALITES_FETCH_LIMIT, 0),
      ]);
      return { total, articles };
    },
    ["public-actualites-listing", key],
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [PUBLIC_CACHE_TAGS.actualitesListing],
    },
  )();
}
