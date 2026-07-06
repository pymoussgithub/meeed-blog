import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { DocumentList } from "@/components/document/DocumentList";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import {
  countArticlesByCategorySlug,
  getArticlesByCategorySlug,
} from "@/lib/services/article.service";
import { getCategoryBySlug } from "@/lib/services/category.service";
import { getDocumentsByProject } from "@/lib/services/document.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

const PAGE_SIZE = 9;

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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? "1"));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [articles, total, projectDocuments] = await Promise.all([
    getArticlesByCategorySlug(slug, PAGE_SIZE, offset),
    countArticlesByCategorySlug(slug),
    category.project?.isActive
      ? getDocumentsByProject(category.project.id)
      : Promise.resolve([]),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: category.name, path: `/c/${category.slug}` },
  ]);

  return (
    <div className="container-meeed py-12">
      <JsonLd data={breadcrumb} />

      <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">Catégorie</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{category.name}</h1>
      {category.description ? (
        <p className="mt-4 max-w-2xl text-primary/70">{category.description}</p>
      ) : null}

      {projectDocuments.length > 0 ? (
        <div className="mt-10">
          <DocumentList documents={projectDocuments} title="Documents du projet" />
        </div>
      ) : null}

      {articles.length === 0 ? (
        <p className="mt-10 text-primary/60">Aucun article publié dans cette catégorie.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/c/${slug}`}
      />
    </div>
  );
}
