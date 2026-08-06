import { notFound, redirect } from "next/navigation";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth-helpers";
import { toDocumentAssociableArticles } from "@/lib/document-article-options";
import { getAdminArticles } from "@/lib/services/article.service";
import { getCategoriesForArticleForm } from "@/lib/services/category.service";
import { getDocumentByIdForAdmin } from "@/lib/services/document.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditDocumentPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const document = await getDocumentByIdForAdmin(id);

  if (!document) {
    notFound();
  }

  if (user?.role !== "ADMIN" && document.uploadedById !== user?.id) {
    redirect("/admin/documents");
  }

  const [articlesResult, categories] = await Promise.all([
    getAdminArticles({
      authorId: user?.role === "ADMIN" ? undefined : user?.id,
      pageSize: 500,
    }),
    getCategoriesForArticleForm(),
  ]);

  return (
    <div className="container-meeed py-6">
      <Button href="/admin/documents" variant="outline" className="mb-4 gap-2 !px-4 !py-2 text-xs">
        <span aria-hidden="true">←</span>
        Retour aux documents
      </Button>
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Gestion</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Éditer le document</h1>
        <p className="mt-0.5 text-xs text-primary/50">{document.fileName}</p>
      </div>
      <DocumentForm
        documentId={document.id}
        articles={toDocumentAssociableArticles(articlesResult.articles)}
        categories={categories}
        initialData={{
          title: document.title,
          description: document.description,
          visibility: document.visibility,
          isArchived: document.isArchived,
          fileName: document.fileName,
          fileSize: document.fileSize,
          articleId: document.articleId,
          categoryId: document.categoryId,
        }}
      />
    </div>
  );
}
