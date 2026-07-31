import { Suspense } from "react";
import { Button } from "@/components/ui/Button";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDocumentVisibilityLabel } from "@/lib/document-visibility";
import { getDashboardStats } from "@/lib/services/article.service";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function mapArticle(article: {
  id: string;
  title: string;
  status: string;
  updatedAt: Date;
  author: { name: string };
}) {
  return {
    id: article.id,
    title: article.title,
    status: article.status,
    updatedAt: article.updatedAt,
    author: { name: article.author.name },
  };
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const activeTab = params.tab ?? "recent";
  const isAdmin = user.role === "ADMIN";
  const stats = await getDashboardStats(user.id, isAdmin);
  const recentCount = stats.published + stats.drafts + stats.archived;

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Dashboard</h1>
          <p className="mt-2 text-primary/70">
            Bienvenue, {user.name}.{" "}
            {isAdmin
              ? "Vue d’ensemble du magazine et de vos contenus."
              : "Vue d’ensemble de vos contenus MEEED."}
          </p>
        </div>
        <Button href="/admin/articles/nouveau" variant="accent" data-tour-id="admin.articles.new-button">
          + Nouvel article
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour-id="admin.dashboard.stats">
        <AdminStatCard
          label="Publiés"
          value={stats.published}
          accent="#4ecdc4"
          href="/admin?tab=published"
          active={activeTab === "published"}
          data-tour-id="admin.dashboard.stat-card"
        />
        <AdminStatCard
          label="Brouillons"
          value={stats.drafts}
          accent="#94979b"
          href="/admin?tab=drafts"
          active={activeTab === "drafts"}
          data-tour-id="admin.dashboard.stat-card"
        />
        <AdminStatCard
          label="Archivés"
          value={stats.archived}
          accent="#292f36"
          href="/admin?tab=archived"
          active={activeTab === "archived"}
          data-tour-id="admin.dashboard.stat-card"
        />
        <AdminStatCard
          label="Documents"
          value={stats.documents}
          href="/admin?tab=documents"
          active={activeTab === "documents"}
          data-tour-id="admin.dashboard.stat-card"
        />
      </div>

      <div className="mt-10">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-gray-100" />}>
          <DashboardOverview
            isAdmin={isAdmin}
            counts={{
              recent: recentCount,
              published: stats.published,
              drafts: stats.drafts,
              archived: stats.archived,
              documents: stats.documents,
            }}
            recent={stats.recentArticles.map(mapArticle)}
            published={stats.publishedArticles.map(mapArticle)}
            drafts={stats.draftArticles.map(mapArticle)}
            archived={stats.archivedArticles.map(mapArticle)}
            documents={stats.recentDocuments.map((document) => ({
              id: document.id,
              title: document.title,
              fileName: document.fileName,
              fileSize: document.fileSize,
              visibility: document.visibility,
              visibilityLabel: getDocumentVisibilityLabel(document.visibility),
              createdAt: document.createdAt,
              article: document.article,
              project: document.project,
              uploadedBy: { name: document.uploadedBy.name },
            }))}
          />
        </Suspense>
      </div>
    </div>
  );
}
