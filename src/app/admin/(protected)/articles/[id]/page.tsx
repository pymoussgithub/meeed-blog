import { notFound, redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { ArticleForumLinksPanel } from "@/components/admin/ArticleForumLinksPanel";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  getArticleForumLinksForAdmin,
  listForumTopicsForLinking,
} from "@/lib/services/article-forum.service";
import { getArticleById } from "@/lib/services/article.service";
import { getCategoriesForArticleForm } from "@/lib/services/category.service";
import { getActiveForumCategories } from "@/lib/services/forum-category.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  if (user?.role !== "ADMIN" && article.authorId !== user?.id) {
    redirect("/admin/articles");
  }

  const categories = await getCategoriesForArticleForm();

  const canManageForumLinks =
    user?.role === "ADMIN" || article.authorId === user?.id;

  const [forumLinks, forumCategories, browsableTopics] = canManageForumLinks
    ? await Promise.all([
        getArticleForumLinksForAdmin(article.id),
        getActiveForumCategories(),
        listForumTopicsForLinking(),
      ])
    : [[], [], []];

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Rédaction</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Éditer l&apos;article</h1>
        <p className="mt-0.5 font-mono text-xs text-primary/50">/a/{article.slug}</p>
      </div>
      <ArticleForm
        articleId={article.id}
        categories={categories}
        initialData={{
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          coverImagePublicId: article.coverImagePublicId,
          status: article.status,
          categoryIds: article.categories.map((item) => item.categoryId),
        }}
        forumLinksPanel={
          canManageForumLinks ? (
            <ArticleForumLinksPanel
              articleId={article.id}
              links={forumLinks}
              categories={forumCategories.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              browsableTopics={browsableTopics.map((topic) => ({
                id: topic.id,
                title: topic.title,
                slug: topic.slug,
                status: topic.status,
                lastPostAt: topic.lastPostAt?.toISOString() ?? null,
                categoryName: topic.category.name,
                authorName: topic.author.name,
              }))}
            />
          ) : null
        }
      />
    </div>
  );
}
