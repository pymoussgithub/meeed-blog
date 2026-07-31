import { Suspense } from "react";
import { ProjectsAdminTable } from "@/components/admin/ProjectsAdminTable";
import { ProjectsAdminToolbar } from "@/components/admin/ProjectsAdminToolbar";
import { Button } from "@/components/ui/Button";
import { getProjectCoverUrl } from "@/lib/project-cover";
import { getAllProjectsForAdmin } from "@/lib/services/project.service";

type PageProps = {
  searchParams: Promise<{
    visibility?: string;
    q?: string;
  }>;
};

export default async function AdminProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allProjects = await getAllProjectsForAdmin();

  const stats = {
    total: allProjects.length,
    active: allProjects.filter((project) => project.isActive).length,
    hidden: allProjects.filter((project) => !project.isActive).length,
  };

  const query = params.q?.trim().toLowerCase() ?? "";
  const visibility = params.visibility ?? "";
  const canReorder = !query && !visibility;

  const projects = allProjects
    .filter((project) => {
      if (visibility === "active" && !project.isActive) return false;
      if (visibility === "hidden" && project.isActive) return false;

      if (!query) return true;

      return (
        project.title.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query) ||
        project.summary.toLowerCase().includes(query)
      );
    })
    .map((project) => ({
      id: project.id,
      title: project.title,
      slug: project.slug,
      summary: project.summary,
      isActive: project.isActive,
      sortOrder: project.sortOrder,
      updatedAt: project.updatedAt,
      coverUrl: getProjectCoverUrl(project),
      category: { name: project.category.name, slug: project.category.slug },
      _count: { articles: project._count.articles },
    }));

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Projets</h1>
          <p className="mt-1 text-sm text-primary/60">
            {projects.length} résultat{projects.length > 1 ? "s" : ""}
            {params.q ? ` pour « ${params.q} »` : ""}
            {canReorder ? " · organisez l’ordre par glisser-déposer" : ""}
          </p>
        </div>
        <Button href="/admin/projets/nouveau" variant="accent">
          + Nouveau projet
        </Button>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-gray-100" />}>
          <ProjectsAdminToolbar stats={stats} />
        </Suspense>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-primary-dark">Aucun projet trouvé</p>
          <p className="mt-2 text-sm text-primary/60">
            {params.q || params.visibility
              ? "Essayez d’élargir vos filtres ou de réinitialiser la recherche."
              : "Commencez par créer votre premier projet MEEED."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(params.q || params.visibility) && (
              <Button href="/admin/projets" variant="outline">
                Réinitialiser les filtres
              </Button>
            )}
            <Button href="/admin/projets/nouveau" variant="accent">
              Créer un projet
            </Button>
          </div>
        </div>
      ) : (
        <ProjectsAdminTable projects={projects} canReorder={canReorder} />
      )}
    </div>
  );
}
