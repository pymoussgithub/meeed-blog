import { ProjectForm } from "@/components/admin/ProjectForm";
import {
  getAllProjectsForAdmin,
  getCategoriesAvailableForProject,
} from "@/lib/services/project.service";

export default async function AdminNewProjectPage() {
  const [projects, categories] = await Promise.all([
    getAllProjectsForAdmin(),
    getCategoriesAvailableForProject(),
  ]);

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Gestion</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Nouveau projet</h1>
      </div>
      <ProjectForm isNew defaultSortOrder={projects.length} categories={categories} />
    </div>
  );
}
