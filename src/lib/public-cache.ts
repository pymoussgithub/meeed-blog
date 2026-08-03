import { unstable_cache } from "next/cache";
import {
  getFilteredPublishedArticles,
} from "@/lib/services/article.service";
import { getAllCategories } from "@/lib/services/category.service";
import { getActiveProjects } from "@/lib/services/project.service";

/** TTL court pour les listes publiques (navigation soft quasi instantanée). */
export const PUBLIC_REVALIDATE_SECONDS = 60;

export const getCachedHomeNews = unstable_cache(
  async () => getFilteredPublishedArticles({ contentType: "news" }, 5, 0),
  ["public-home-news"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getCachedActiveProjects = unstable_cache(
  async () => getActiveProjects(),
  ["public-active-projects"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getCachedAllCategories = unstable_cache(
  async () => getAllCategories(),
  ["public-all-categories"],
  { revalidate: PUBLIC_REVALIDATE_SECONDS },
);
