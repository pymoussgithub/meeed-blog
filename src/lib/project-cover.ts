import { getCoverProjectUrl } from "@/lib/cloudinary";

type ProjectCoverSource = {
  coverImagePublicId: string | null;
  coverImageUrl: string | null;
  articles: Array<{
    coverImagePublicId: string | null;
    coverImageUrl: string | null;
  }>;
};

/** Couverture projet, sinon dernière image d’article publié du projet. */
export function getProjectCoverUrl(project: ProjectCoverSource): string | null {
  if (project.coverImagePublicId) {
    return getCoverProjectUrl(project.coverImagePublicId);
  }
  if (project.coverImageUrl) {
    return project.coverImageUrl;
  }

  const article = project.articles[0];
  if (!article) {
    return null;
  }
  if (article.coverImagePublicId) {
    return getCoverProjectUrl(article.coverImagePublicId);
  }
  return article.coverImageUrl;
}
