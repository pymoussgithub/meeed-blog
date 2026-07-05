import type { MetadataRoute } from "next";
import { getPublishedArticleSlugs } from "@/lib/services/article.service";
import { getAllCategories } from "@/lib/services/category.service";
import { getSiteUrl } from "@/lib/seo";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "daily", priority: 1 },
  { url: "/actualites", changeFrequency: "daily", priority: 0.9 },
  { url: "/projets", changeFrequency: "monthly", priority: 0.8 },
  { url: "/documents", changeFrequency: "weekly", priority: 0.7 },
  { url: "/recherche", changeFrequency: "monthly", priority: 0.5 },
  { url: "/a-propos", changeFrequency: "yearly", priority: 0.6 },
  { url: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { url: "/don", changeFrequency: "yearly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");

  const withBase = (entries: MetadataRoute.Sitemap) =>
    entries.map((entry) => ({
      ...entry,
      url: entry.url.startsWith("http") ? entry.url : `${base}${entry.url}`,
    }));

  try {
    const [articles, categories] = await Promise.all([
      getPublishedArticleSlugs(),
      getAllCategories(),
    ]);

    const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `/a/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `/c/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return withBase([...STATIC_PAGES, ...categoryEntries, ...articleEntries]);
  } catch {
    return withBase(STATIC_PAGES);
  }
}
