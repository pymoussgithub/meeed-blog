import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ForumAdminToolbar } from "@/components/admin/ForumAdminToolbar";
import { ForumModerationTable } from "@/components/admin/ForumModerationTable";
import { ForumPostsModerationTable } from "@/components/admin/ForumPostsModerationTable";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { requireAdmin } from "@/lib/auth-helpers";
import { getForumCategoriesForAdmin } from "@/lib/services/forum-category.service";
import { getAdminForumPosts } from "@/lib/services/forum-post.service";
import {
  getAdminForumTopicStats,
  getAdminForumTopics,
} from "@/lib/services/forum-topic.service";
import type { ForumTopicStatus } from "@prisma/client";

type PageProps = {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
    page?: string;
    tab?: string;
    postsPage?: string;
  }>;
};

export default async function AdminForumModerationPage({ searchParams }: PageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin");
  }

  const params = await searchParams;
  const tab = params.tab === "messages" ? "messages" : "sujets";
  const status =
    params.status === "OPEN" || params.status === "LOCKED" || params.status === "ARCHIVED"
      ? (params.status as ForumTopicStatus)
      : undefined;

  const search = params.q?.trim() || undefined;
  const categoryId = params.category?.trim() || undefined;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const [topicsResult, postsResult, categories, stats] = await Promise.all([
    tab === "sujets"
      ? getAdminForumTopics({
          status,
          categoryId,
          search,
          page,
          pageSize: 20,
        })
      : Promise.resolve({
          topics: [] as Awaited<ReturnType<typeof getAdminForumTopics>>["topics"],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        }),
    tab === "messages"
      ? getAdminForumPosts({
          search,
          page,
          pageSize: 20,
        })
      : Promise.resolve({
          posts: [] as Awaited<ReturnType<typeof getAdminForumPosts>>["posts"],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        }),
    getForumCategoriesForAdmin(),
    getAdminForumTopicStats(),
  ]);

  const resultTotal = tab === "messages" ? postsResult.total : topicsResult.total;
  const resultPage = tab === "messages" ? postsResult.page : topicsResult.page;
  const resultTotalPages = tab === "messages" ? postsResult.totalPages : topicsResult.totalPages;

  const paginationQuery = {
    tab: params.tab,
    status: params.status,
    category: params.category,
    q: params.q,
  };

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const hasFilters = Boolean(params.q || params.status || params.category);
  const emptyHref = tab === "messages" ? "/admin/forum?tab=messages" : "/admin/forum";

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Modération forum</h1>
          <p className="mt-1 text-sm text-primary/60">
            {resultTotal} résultat{resultTotal > 1 ? "s" : ""}
            {params.q ? ` pour « ${params.q} »` : ""}
          </p>
        </div>
        <Button href="/admin/forum/rubriques" variant="outline">
          Gérer les rubriques
        </Button>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-gray-100" />}>
          <ForumAdminToolbar
            tab={tab}
            categories={categoryOptions}
            stats={stats}
          />
        </Suspense>
      </div>

      {tab === "sujets" ? (
        topicsResult.topics.length === 0 ? (
          <EmptyState
            title="Aucune discussion trouvée"
            description={
              hasFilters
                ? "Essayez d’élargir vos filtres ou de réinitialiser la recherche."
                : "Aucune discussion à modérer pour le moment."
            }
            resetHref={hasFilters ? emptyHref : undefined}
          />
        ) : (
          <>
            <div className="mt-6">
              <ForumModerationTable
                topics={topicsResult.topics}
                categories={categoryOptions}
              />
            </div>
            <Pagination
              currentPage={resultPage}
              totalPages={resultTotalPages}
              basePath="/admin/forum"
              query={paginationQuery}
            />
          </>
        )
      ) : postsResult.posts.length === 0 ? (
        <EmptyState
          title="Aucun message trouvé"
          description={
            hasFilters
              ? "Essayez d’élargir vos filtres ou de réinitialiser la recherche."
              : "Aucun message à modérer pour le moment."
          }
          resetHref={hasFilters ? emptyHref : undefined}
        />
      ) : (
        <>
          <div className="mt-6">
            <ForumPostsModerationTable posts={postsResult.posts} />
          </div>
          <Pagination
            currentPage={resultPage}
            totalPages={resultTotalPages}
            basePath="/admin/forum"
            query={paginationQuery}
          />
        </>
      )}
    </div>
  );
}

function EmptyState({
  title,
  description,
  resetHref,
}: {
  title: string;
  description: string;
  resetHref?: string;
}) {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <p className="text-lg font-medium text-primary-dark">{title}</p>
      <p className="mt-2 text-sm text-primary/60">{description}</p>
      {resetHref ? (
        <div className="mt-6">
          <Button href={resetHref} variant="outline">
            Réinitialiser les filtres
          </Button>
        </div>
      ) : null}
      {!resetHref ? (
        <div className="mt-6">
          <Link href="/forum" className="text-sm font-medium text-accent-dark hover:text-accent">
            Voir le forum public →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
