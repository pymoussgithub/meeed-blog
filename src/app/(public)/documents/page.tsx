import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DocumentList } from "@/components/document/DocumentList";
import { DocumentsFilterPanel } from "@/components/documents/DocumentsFilterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildDocumentsUrl,
  hasActiveDocumentFilters,
  listingParamsToDocumentFilters,
  parseDocumentsListingParams,
} from "@/lib/documents-listing";
import {
  countPublicDocuments,
  getPublicDocumentNewsCategories,
  getPublicDocumentProjects,
  getPublicDocuments,
  getPublicDocumentUploaders,
} from "@/lib/services/document.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    project?: string;
    category?: string;
    user?: string;
    from?: string;
    to?: string;
    linked?: string;
  }>;
};

export const metadata: Metadata = buildPageMetadata({
  title: "Documents",
  description: "Bibliothèque de documents PDF de l'association MEEED.",
  path: "/documents",
});

function getResultsLabel(total: number, isFiltered: boolean) {
  if (total === 0) return isFiltered ? "Aucun document" : "Aucun document public";
  if (total === 1) return "1 document";
  return `${total} documents`;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const params = parseDocumentsListingParams(rawParams);
  const filters = listingParamsToDocumentFilters(params);
  const isFiltered = hasActiveDocumentFilters(params);

  let documents: Awaited<ReturnType<typeof getPublicDocuments>> = [];
  let projects: Awaited<ReturnType<typeof getPublicDocumentProjects>> = [];
  let categories: Awaited<ReturnType<typeof getPublicDocumentNewsCategories>> = [];
  let uploaders: Awaited<ReturnType<typeof getPublicDocumentUploaders>> = [];
  let total = 0;
  let dbError = false;

  try {
    const [documentList, projectList, categoryList, uploaderList, documentCount] =
      await Promise.all([
        getPublicDocuments(filters),
        getPublicDocumentProjects(),
        getPublicDocumentNewsCategories(),
        getPublicDocumentUploaders(),
        countPublicDocuments(filters),
      ]);

    documents = documentList;
    projects = projectList;
    categories = categoryList;
    uploaders = uploaderList;
    total = documentCount;
  } catch {
    dbError = true;
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Documents", path: "/documents" },
  ]);

  return (
    <div className="container-meeed py-12">
      <JsonLd data={breadcrumb} />
      <p className="text-sm font-semibold uppercase tracking-wider text-accent-dark">
        Ressources
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Documents</h1>
      <p className="mt-4 max-w-2xl text-primary/70">
        Dossiers techniques, fiches et PDF produits par l&apos;association MEEED. Filtrez par
        projet, catégorie, contributeur ou date pour trouver rapidement le bon document.
      </p>

      {dbError ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
          Base de données non connectée. Lancez PostgreSQL puis{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:migrate</code>.
        </p>
      ) : (
        <>
          <div className="mt-8">
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-gray-100" />}>
              <DocumentsFilterPanel
                params={params}
                projects={projects.map(({ id, title, slug }) => ({
                  id,
                  label: title,
                  slug,
                }))}
                categories={categories.map(({ id, name, slug }) => ({
                  id,
                  label: name,
                  slug,
                }))}
                uploaders={uploaders.map(({ id, name }) => ({ id, label: name }))}
              />
            </Suspense>
          </div>

          <p className="mt-6 text-sm font-medium text-primary/60">
            {getResultsLabel(total, isFiltered)}
          </p>

          {total === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-gray-200 px-6 py-16 text-center">
              <p className="text-lg font-medium text-primary/80">
                {isFiltered
                  ? "Aucun document ne correspond à vos filtres."
                  : "Aucun document public pour le moment."}
              </p>
              {isFiltered ? (
                <Link
                  href={buildDocumentsUrl({})}
                  className="mt-4 inline-block text-sm font-semibold text-accent-dark hover:underline"
                >
                  Voir tous les documents
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-8">
              <DocumentList documents={documents} showRelations />
            </div>
          )}
        </>
      )}
    </div>
  );
}
