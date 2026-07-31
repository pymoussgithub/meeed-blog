import type { MetadataRoute } from "next";
import { getPublishedArticleSlugs } from "@/lib/services/article.service";
import { getAllCategories } from "@/lib/services/category.service";
import { getActiveForumCategories } from "@/lib/services/forum-category.service";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/seo";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "daily", priority: 1 },
  { url: "/actualites", changeFrequency: "daily", priority: 0.9 },
  { url: "/categories", changeFrequency: "weekly", priority: 0.75 },
  { url: "/forum", changeFrequency: "daily", priority: 0.85 },
  { url: "/forum/importants", changeFrequency: "daily", priority: 0.7 },
  { url: "/forum/recherche", changeFrequency: "monthly", priority: 0.4 },
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
    const [articles, categories, forumCategories, forumTopics] = await Promise.all([
      getPublishedArticleSlugs(),
      getAllCategories(),
      getActiveForumCategories(),
      prisma.forumTopic.findMany({
        where: {
          deletedAt: null,
          isHidden: false,
          status: { not: "ARCHIVED" },
        },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 500,
      }),
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

    const forumCategoryEntries: MetadataRoute.Sitemap = forumCategories.map((category) => ({
      url: `/forum/r/${category.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const forumTopicEntries: MetadataRoute.Sitemap = forumTopics.map((topic) => ({
      url: `/forum/s/${topic.slug}`,
      lastModified: topic.updatedAt,
      changeFrequency: "daily",
      priority: 0.65,
    }));

    return withBase([
      ...STATIC_PAGES,
      ...categoryEntries,
      ...articleEntries,
      ...forumCategoryEntries,
      ...forumTopicEntries,
    ]);
  } catch {
    return withBase(STATIC_PAGES);
  }
}
