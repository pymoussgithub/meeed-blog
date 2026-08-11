import Link from "next/link";
import { Suspense } from "react";
import { ArticleStatus } from "@prisma/client";
import { ArticlesAdminToolbar } from "@/components/admin/ArticlesAdminToolbar";
import { ArticleListActions } from "@/components/admin/ArticleListActions";
import { ArticleStatusBadge } from "@/components/admin/ArticleStatusBadge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  getAdminArticleAuthors,
  getAdminArticleStats,
  getAdminArticles,
} from "@/lib/services/article.service";
import { getAllCategories } from "@/lib/services/category.service";
import { formatDate } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    author?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const status = Object.values(ArticleStatus).includes(params.status as ArticleStatus)
    ? (params.status as ArticleStatus)
    : undefined;
  const isAdmin = user.role === "ADMIN";
  const authorId = isAdmin ? params.author || undefined : user.id;
  const hasActiveFilters = Boolean(
    params.q || params.status || params.category || params.author,
  );

  const [result, categories, stats, authors] = await Promise.all([
    getAdminArticles({
      status,
      categoryId: params.category,
      search: params.q,
      page,
      authorId,
    }),
    getAllCategories(),
    getAdminArticleStats(authorId),
    isAdmin ? getAdminArticleAuthors() : Promise.resolve([]),
  ]);

  const authorsWithSelf =
    isAdmin && !authors.some((author) => author.id === user.id)
      ? [{ id: user.id, name: user.name ?? "Moi" }, ...authors]
      : authors;

  const paginationQuery = {
    status: params.status,
    category: params.category,
    author: params.author,
    q: params.q,
  };
  const tableActionClassName =
    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Articles</h1>
          <p className="mt-1 text-sm text-primary/60">
            {result.total} résultat{result.total > 1 ? "s" : ""}
            {params.q ? ` pour « ${params.q} »` : ""}
          </p>
        </div>
        <Button href="/admin/articles/nouveau" variant="accent" data-tour-id="admin.articles.new-button">
          + Nouvel article
        </Button>
      </div>

      <div className="mt-8" data-tour-id="admin.articles.filters">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-gray-100" />}>
          <ArticlesAdminToolbar
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
            }))}
            authors={authorsWithSelf}
            currentUserId={user.id}
            stats={stats}
            isAdmin={isAdmin}
          />
        </Suspense>
      </div>

      {result.articles.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-primary-dark">Aucun article trouvé</p>
          <p className="mt-2 text-sm text-primary/60">
            {hasActiveFilters
              ? "Essayez d’élargir vos filtres ou de réinitialiser la recherche."
              : "Commencez par rédiger votre premier article."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {hasActiveFilters && (
              <Button href="/admin/articles" variant="outline">
                Réinitialiser les filtres
              </Button>
            )}
            <Button href="/admin/articles/nouveau" variant="accent">
              Créer un article
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white" data-tour-id="admin.articles.list">
            <table className="w-full table-fixed text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left">
                <tr>
                  <th className={`${isAdmin ? "w-[30%]" : "w-[36%]"} px-3 py-3 font-medium`}>
                    Article
                  </th>
                  <th className="w-[10%] whitespace-nowrap px-2 py-3 font-medium">Statut</th>
                  {isAdmin ? (
                    <th className="w-[12%] px-2 py-3 font-medium">Auteur</th>
                  ) : null}
                  <th className="hidden w-[14%] px-2 py-3 font-medium md:table-cell">Domaines</th>
                  <th className="w-[12%] whitespace-nowrap px-2 py-3 font-medium">Modifié</th>
                  <th className="w-[18%] px-2 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.articles.map((article) => (
                  <tr key={article.id} className="group hover:bg-gray-50/60">
                    <td className="px-3 py-3">
                      <div className="flex items-start gap-3">
                        <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                          {article.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={article.coverImageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-primary/30">
                              Sans image
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="font-medium break-words text-primary-dark hover:text-accent-dark"
                            title={article.title}
                          >
                            {article.title}
                          </Link>
                          {article.excerpt ? (
                            <p className="mt-0.5 break-words text-xs text-primary/50">
                              {article.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3">
                      <ArticleStatusBadge status={article.status} />
                    </td>
                    {isAdmin ? (
                      <td className="px-2 py-3 break-words text-primary/70">{article.author.name}</td>
                    ) : null}
                    <td className="hidden px-2 py-3 text-primary/70 md:table-cell">
                      {article.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {article.categories.map((item) => (
                            <span
                              key={item.category.id}
                              className="inline-flex rounded-full bg-bg-soft px-2 py-0.5 text-xs font-medium text-primary/70"
                            >
                              {item.category.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-primary/70">
                      {formatDate(article.updatedAt)}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col items-stretch gap-2">
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                        >
                          Éditer
                        </Link>
                        {article.status === ArticleStatus.PUBLISHED ? (
                          <Link
                            href={`/a/${article.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                          >
                            Voir
                          </Link>
                        ) : null}
                        <ArticleListActions
                          articleId={article.id}
                          status={article.status}
                          className={tableActionClassName}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={result.page}
            totalPages={result.totalPages}
            basePath="/admin/articles"
            query={paginationQuery}
          />
        </>
      )}
    </div>
  );
}
