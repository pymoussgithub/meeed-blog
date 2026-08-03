import { DocumentsManager } from "@/components/admin/DocumentsManager";
import { Button } from "@/components/ui/Button";
import { getAdminArticles } from "@/lib/services/article.service";
import { getAllDocuments } from "@/lib/services/document.service";
import { getActiveProjects } from "@/lib/services/project.service";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function AdminDocumentsPage() {
  const user = await getCurrentUser();
  const [documents, articlesResult, projects] = await Promise.all([
    getAllDocuments(user?.id, user?.role === "ADMIN"),
    getAdminArticles({
      authorId: user?.role === "ADMIN" ? undefined : user?.id,
      pageSize: 100,
    }),
    getActiveProjects(),
  ]);

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Documents</h1>
          <p className="mt-1 text-sm text-primary/60">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          href="/admin/documents/nouveau"
          variant="accent"
          data-tour-id="admin.documents.new-button"
        >
          + Nouveau document
        </Button>
      </div>
      <div className="mt-8">
        <DocumentsManager
          documents={documents}
          articles={articlesResult.articles.map((article) => ({
            id: article.id,
            title: article.title,
          }))}
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
          }))}
        />
      </div>
    </div>
  );
}
