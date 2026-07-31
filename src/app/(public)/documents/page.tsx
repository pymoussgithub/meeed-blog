import type { Metadata } from "next";
import Link from "next/link";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { DocumentsToolbar } from "@/components/documents/DocumentsToolbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCurrentUser } from "@/lib/auth-helpers";
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

function getEmptyMessage(isFiltered: boolean, isAuthenticated: boolean) {
  if (isFiltered) {
    return "Aucun document ne correspond à vos filtres.";
  }
  if (isAuthenticated) {
    return "Aucun document disponible pour votre niveau d’accès.";
  }
  return "Aucun document public pour le moment.";
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  const rawParams = await searchParams;
  const params = parseDocumentsListingParams(rawParams);
  const filters = listingParamsToDocumentFilters(params);
  const isFiltered = hasActiveDocumentFilters(params);

  let documents: Awaited<ReturnType<typeof getPublicDocuments>> = [];
  let projects: Awaited<ReturnType<typeof getPublicDocumentProjects>> = [];
  let categories: Awaited<ReturnType<typeof getPublicDocumentNewsCategories>> = [];
  let uploaders: Awaited<ReturnType<typeof getPublicDocumentUploaders>> = [];
  let dbError = false;

  try {
    const [documentList, projectList, categoryList, uploaderList] = await Promise.all([
      getPublicDocuments(filters, user),
      getPublicDocumentProjects(user),
      getPublicDocumentNewsCategories(user),
      getPublicDocumentUploaders(user),
    ]);

    documents = documentList;
    projects = projectList;
    categories = categoryList;
    uploaders = uploaderList;
  } catch {
    dbError = true;
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Documents", path: "/documents" },
  ]);

  const filterOptions = {
    projects: projects.map(({ id, title, slug }) => ({
      id,
      label: title,
      slug,
    })),
    categories: categories.map(({ id, name, slug }) => ({
      id,
      label: name,
      slug,
    })),
    uploaders: uploaders.map(({ id, name }) => ({ id, label: name })),
  };

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />
      <h1 className="sr-only">Documents</h1>

      <DocumentsToolbar
        params={params}
        projects={filterOptions.projects}
        categories={filterOptions.categories}
        uploaders={filterOptions.uploaders}
        canAddDocument={Boolean(user)}
      />

      {dbError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Base de données non connectée. Lancez PostgreSQL puis{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:migrate</code>.
        </p>
      ) : documents.length === 0 ? (
        <div className="space-y-3 text-center">
          <DocumentsTable
            documents={[]}
            emptyMessage={getEmptyMessage(isFiltered, Boolean(user))}
          />
          {isFiltered ? (
            <Link
              href={buildDocumentsUrl({})}
              className="inline-block text-sm font-semibold text-accent-dark hover:underline"
            >
              Voir tous les documents
            </Link>
          ) : null}
        </div>
      ) : (
        <DocumentsTable documents={documents} />
      )}
    </div>
  );
}
