import { ProjectsManager } from "@/components/admin/ProjectsManager";
import { getAllProjectsForAdmin } from "@/lib/services/project.service";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsForAdmin();

  return (
    <div className="container-meeed py-10">
      <h1 className="text-2xl font-bold">Projets</h1>
      <p className="mt-2 text-primary/70">
        Créez et gérez les projets MEEED. Chaque projet dispose d&apos;une catégorie dédiée
        pour classer les articles des contributeurs.
      </p>
      <div className="mt-8">
        <ProjectsManager projects={projects} />
      </div>
    </div>
  );
}
