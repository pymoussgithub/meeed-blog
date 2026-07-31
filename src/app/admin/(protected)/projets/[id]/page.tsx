import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import {
  countProjectArticles,
  getCategoriesAvailableForProject,
  getProjectById,
} from "@/lib/services/project.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditProjectPage({ params }: PageProps) {
  const { id } = await params;
  const [project, categories] = await Promise.all([
    getProjectById(id),
    getCategoriesAvailableForProject(),
  ]);

  if (!project) {
    notFound();
  }

  const articleCount = await countProjectArticles(id);

  return (
    <div className="container-meeed py-6">
      <div className="mb-4">
        <p className="text-xs font-medium text-accent-dark">Gestion</p>
        <h1 className="mt-0.5 text-xl font-bold text-primary-dark">Éditer le projet</h1>
        <p className="mt-0.5 font-mono text-xs text-primary/50">/c/{project.category.slug}</p>
      </div>
      <ProjectForm
        projectId={project.id}
        articleCount={articleCount}
        categories={categories}
        initialData={{
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          description: project.description,
          donationUrl: project.donationUrl,
          coverImageUrl: project.coverImageUrl,
          coverImagePublicId: project.coverImagePublicId,
          color: project.color,
          sortOrder: project.sortOrder,
          isActive: project.isActive,
          categoryId: project.categoryId,
        }}
      />
    </div>
  );
}
