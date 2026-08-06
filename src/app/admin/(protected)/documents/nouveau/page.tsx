import { DocumentCreateForm } from "@/components/admin/DocumentCreateForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { toDocumentAssociableArticles } from "@/lib/document-article-options";
import { getAdminArticles } from "@/lib/services/article.service";
import { getCategoriesForArticleForm } from "@/lib/services/category.service";

export default async function AdminNewDocumentPage() {
  const user = await getCurrentUser();
  const [articlesResult, categories] = await Promise.all([
    getAdminArticles({
      authorId: user?.role === "ADMIN" ? undefined : user?.id,
      pageSize: 500,
    }),
    getCategoriesForArticleForm(),
  ]);

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Gestion</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Nouveau document</h1>
        <p className="mt-0.5 text-xs text-primary/50">
          Renseignez les infos, choisissez le fichier, puis validez l’enregistrement.
        </p>
      </div>
      <DocumentCreateForm
        articles={toDocumentAssociableArticles(articlesResult.articles)}
        categories={categories}
      />
    </div>
  );
}
