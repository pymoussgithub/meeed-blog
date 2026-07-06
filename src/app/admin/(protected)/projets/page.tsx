import Link from "next/link";
import { Suspense } from "react";
import { ProjectListActions } from "@/components/admin/ProjectListActions";
import { ProjectStatusBadge } from "@/components/admin/ProjectStatusBadge";
import { ProjectsAdminToolbar } from "@/components/admin/ProjectsAdminToolbar";
import { Button } from "@/components/ui/Button";
import { getAllProjectsForAdmin } from "@/lib/services/project.service";
import { formatDate } from "@/lib/utils";

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

  const projects = allProjects.filter((project) => {
    if (visibility === "active" && !project.isActive) return false;
    if (visibility === "hidden" && project.isActive) return false;

    if (!query) return true;

    return (
      project.title.toLowerCase().includes(query) ||
      project.slug.toLowerCase().includes(query) ||
      project.summary.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Projets</h1>
          <p className="mt-1 text-sm text-primary/60">
            {projects.length} résultat{projects.length > 1 ? "s" : ""}
            {params.q ? ` pour « ${params.q} »` : ""}
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
        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Projet</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Articles</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Ordre</th>
                <th className="px-4 py-3 font-medium">Modifié</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((project) => {
                const articleCount = project.category._count.articles;

                return (
                  <tr key={project.id} className="group hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                          {project.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={project.coverImageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-full w-full items-center justify-center text-[10px] text-primary/30"
                              style={{
                                backgroundColor: project.color ? `${project.color}22` : undefined,
                              }}
                            >
                              {project.color ? (
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: project.color }}
                                />
                              ) : (
                                "Sans image"
                              )}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/projets/${project.id}`}
                            className="font-medium text-primary-dark hover:text-accent-dark"
                          >
                            {project.title}
                          </Link>
                          <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                            /c/{project.slug}
                          </p>
                          {project.summary ? (
                            <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                              {project.summary}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ProjectStatusBadge isActive={project.isActive} />
                    </td>
                    <td className="hidden px-4 py-3 text-primary/70 sm:table-cell">
                      {articleCount}
                    </td>
                    <td className="hidden px-4 py-3 text-primary/70 md:table-cell">
                      {project.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-primary/70">
                      {formatDate(project.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Link
                          href={`/admin/projets/${project.id}`}
                          className="text-accent-dark hover:underline"
                        >
                          Éditer
                        </Link>
                        {project.isActive ? (
                          <Link
                            href={`/c/${project.slug}`}
                            target="_blank"
                            className="text-primary/60 hover:text-accent-dark hover:underline"
                          >
                            Voir
                          </Link>
                        ) : null}
                        <ProjectListActions
                          projectId={project.id}
                          projectTitle={project.title}
                          articleCount={articleCount}
                          isActive={project.isActive}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
