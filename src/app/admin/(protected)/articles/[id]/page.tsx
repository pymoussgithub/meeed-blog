import { notFound, redirect } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getArticleById } from "@/lib/services/article.service";
import { getCategoriesForArticleForm } from "@/lib/services/category.service";

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

  const categories = await getCategoriesForArticleForm(
    article.categories.map((item) => item.categoryId),
  );

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
      />
    </div>
  );
}
