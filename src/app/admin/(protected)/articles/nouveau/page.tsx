import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCategoriesForArticleForm } from "@/lib/services/category.service";

export default async function AdminNewArticlePage() {
  const categories = await getCategoriesForArticleForm();

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Rédaction</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Nouvel article</h1>
      </div>
      <ArticleForm categories={categories} isNew />
    </div>
  );
}
