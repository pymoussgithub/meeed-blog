import { notFound, redirect } from "next/navigation";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAdminArticles } from "@/lib/services/article.service";
import { getDocumentByIdForAdmin } from "@/lib/services/document.service";
import { getActiveProjects } from "@/lib/services/project.service";

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

  const [articlesResult, projects] = await Promise.all([
    getAdminArticles({
      authorId: user?.role === "ADMIN" ? undefined : user?.id,
      pageSize: 100,
    }),
    getActiveProjects(),
  ]);

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Gestion</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Éditer le document</h1>
        <p className="mt-0.5 text-xs text-primary/50">{document.fileName}</p>
      </div>
      <DocumentForm
        documentId={document.id}
        articles={articlesResult.articles.map((article) => ({
          id: article.id,
          title: article.title,
          projectId: article.projectId,
        }))}
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
        }))}
        initialData={{
          title: document.title,
          description: document.description,
          visibility: document.visibility,
          isArchived: document.isArchived,
          fileName: document.fileName,
          fileSize: document.fileSize,
          articleId: document.articleId,
          projectId: document.projectId,
        }}
      />
    </div>
  );
}
