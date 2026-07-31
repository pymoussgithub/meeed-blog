import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { DocumentList } from "@/components/document/DocumentList";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  countArticlesByCategorySlug,
  getArticlesByCategorySlug,
  type ArticleWithRelations,
} from "@/lib/services/article.service";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { getDocumentsByProject } from "@/lib/services/document.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_SIZE = 9;
const PROJECT_ARTICLES_LIMIT = 200;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return { title: "Catégorie introuvable" };
    }

    return buildPageMetadata({
      title: category.name,
      description: category.description ?? `Articles sur ${category.name} — MEEED`,
      path: `/c/${category.slug}`,
    });
  } catch {
    return { title: "Catégorie" };
  }
}

function ArticleGrid({ articles }: { articles: ArticleWithRelations[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const user = await getCurrentUser();
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const activeProjects = category.projects.filter((project) => project.isActive);
  const hasProjects = activeProjects.length > 0;

  const [articles, total, projectDocumentLists] = await Promise.all([
    getArticlesByCategorySlug(
      slug,
      hasProjects ? PROJECT_ARTICLES_LIMIT : PAGE_SIZE,
      hasProjects ? 0 : offset,
    ),
    countArticlesByCategorySlug(slug),
    Promise.all(activeProjects.map((project) => getDocumentsByProject(project.id, user))),
  ]);

  const projectDocuments = Array.from(
    new Map(
      projectDocumentLists.flatMap((documents, index) => {
        const project = activeProjects[index];
        return documents.map((document) => [
          document.id,
          {
            ...document,
            project: {
              id: project.id,
              title: project.title,
              slug: project.slug,
              category: { slug: category.slug },
            },
          },
        ]);
      }),
    ).values(),
  );

  const projectIds = new Set(activeProjects.map((project) => project.id));
  const articlesByProjectId = new Map<string, ArticleWithRelations[]>(
    activeProjects.map((project) => [project.id, []]),
  );
  const unassignedArticles: ArticleWithRelations[] = [];

  for (const article of articles) {
    if (article.projectId && projectIds.has(article.projectId)) {
      articlesByProjectId.get(article.projectId)!.push(article);
    } else {
      unassignedArticles.push(article);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: category.name, path: `/c/${category.slug}` },
  ]);

  return (
    <div className="container-meeed py-12" data-tour-id="category.filtered-list">
      <JsonLd data={breadcrumb} />

      <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">Catégorie</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-primary/70">{category.description}</p>
      ) : null}

      {hasProjects ? (
        <div className="mt-12 space-y-14">
          {activeProjects.map((project) => {
            const projectArticles = articlesByProjectId.get(project.id) ?? [];
            const accent = project.color ?? "var(--color-accent-dark)";

            return (
              <section key={project.id}>
                <div className="mb-5 border-b border-gray-100 pb-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: accent }}
                  >
                    Projet
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold sm:text-2xl">
                      <Link
                        href={`/actualites?project=${project.slug}`}
                        className="transition-colors hover:text-accent-dark"
                      >
                        {project.title}
                      </Link>
                    </h2>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {projectArticles.length} article
                      {projectArticles.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  {project.summary ? (
                    <p className="mt-2 text-sm text-primary/65">{project.summary}</p>
                  ) : null}
                </div>

                {projectArticles.length === 0 ? (
                  <p className="text-sm text-primary/55">
                    Aucun article publié pour ce projet pour le moment.
                  </p>
                ) : (
                  <ArticleGrid articles={projectArticles} />
                )}
              </section>
            );
          })}

          {unassignedArticles.length > 0 ? (
            <section>
              <div className="mb-5 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold sm:text-2xl">Autres articles</h2>
                <p className="mt-2 text-sm text-primary/65">
                  Articles de cette catégorie non rattachés à un projet.
                </p>
              </div>
              <ArticleGrid articles={unassignedArticles} />
            </section>
          ) : null}
        </div>
      ) : articles.length === 0 ? (
        <p className="mt-10 text-primary/60">Aucun article publié dans cette catégorie.</p>
      ) : (
        <>
          <div className="mt-10">
            <ArticleGrid articles={articles} />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/c/${slug}`}
          />
        </>
      )}

      {projectDocuments.length > 0 ? (
        <div className="mt-14">
          <DocumentList
            documents={projectDocuments}
            title="Documents liés aux projets de cette catégorie"
          />
        </div>
      ) : null}
    </div>
  );
}
