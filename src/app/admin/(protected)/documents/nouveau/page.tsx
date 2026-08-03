import { DocumentCreateForm } from "@/components/admin/DocumentCreateForm";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAdminArticles } from "@/lib/services/article.service";
import { getActiveProjects } from "@/lib/services/project.service";

export default async function AdminNewDocumentPage() {
  const user = await getCurrentUser();
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
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Nouveau document</h1>
        <p className="mt-0.5 text-xs text-primary/50">
          Renseignez les infos, choisissez le fichier, puis validez l’enregistrement.
        </p>
      </div>
      <DocumentCreateForm
        articles={articlesResult.articles.map((article) => ({
          id: article.id,
          title: article.title,
          projectId: article.projectId,
        }))}
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
        }))}
      />
    </div>
  );
}
