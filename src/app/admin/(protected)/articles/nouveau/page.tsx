import { ArticleForm } from "@/components/admin/ArticleForm";
import { listForumTopicsForLinking } from "@/lib/services/article-forum.service";
import { getCategoriesForArticleForm } from "@/lib/services/category.service";
import { getActiveForumCategories } from "@/lib/services/forum-category.service";

export default async function AdminNewArticlePage() {
  const [categories, forumCategories, browsableTopics] = await Promise.all([
    getCategoriesForArticleForm(),
    getActiveForumCategories(),
    listForumTopicsForLinking(),
  ]);

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Rédaction</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Nouvel article</h1>
      </div>
      <ArticleForm
        categories={categories}
        isNew
        forumLinkOptions={{
          categories: forumCategories.map((category) => ({
            id: category.id,
            name: category.name,
          })),
          browsableTopics: browsableTopics.map((topic) => ({
            id: topic.id,
            title: topic.title,
            slug: topic.slug,
            status: topic.status,
            lastPostAt: topic.lastPostAt?.toISOString() ?? null,
            categoryName: topic.category.name,
            authorName: topic.author.name,
          })),
        }}
      />
    </div>
  );
}
