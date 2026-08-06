import type { DocumentAssociableArticle } from "@/components/admin/DocumentArticlePicker";

type ArticleForPicker = {
  id: string;
  title: string;
  excerpt: string | null;
  status: string;
  publishedAt: Date | null;
  author: { name: string };
  categories: Array<{
    category: { id: string; name: string };
  }>;
};

export function toDocumentAssociableArticles(
  articles: ArticleForPicker[],
): DocumentAssociableArticle[] {
  return articles.map((article) => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    status: article.status,
    authorName: article.author.name,
    categoryIds: article.categories.map(({ category }) => category.id),
    categoryNames: article.categories.map(({ category }) => category.name),
    publishedAt: article.publishedAt?.toISOString() ?? null,
  }));
}
