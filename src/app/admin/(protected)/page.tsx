import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ArticleStatusBadge } from "@/components/admin/ArticleStatusBadge";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDashboardStats } from "@/lib/services/article.service";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const stats = await getDashboardStats(user.id, user.role === "ADMIN");

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Dashboard</h1>
          <p className="mt-2 text-primary/70">
            Bienvenue, {user.name}. Gérez les actualités MEEED.
          </p>
        </div>
        <Button href="/admin/articles/nouveau" variant="accent">
          + Nouvel article
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Publiés" value={stats.published} accent="#4ecdc4" />
        <AdminStatCard label="Brouillons" value={stats.drafts} accent="#94979b" />
        <AdminStatCard label="Archivés" value={stats.archived} accent="#292f36" />
        <AdminStatCard label="Documents" value={stats.documents} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Derniers articles</h2>
          <ArticleList items={stats.recentArticles} empty="Aucun article pour le moment." />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Mes brouillons</h2>
          <ArticleList items={stats.userDrafts} empty="Aucun brouillon en cours." />
        </section>
      </div>
    </div>
  );
}

function ArticleList({
  items,
  empty,
}: {
  items: Awaited<ReturnType<typeof getDashboardStats>>["recentArticles"];
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-primary/60">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
      {items.map((article) => (
        <li key={article.id} className="flex items-start justify-between gap-4 p-4">
          <div>
            <Link
              href={`/admin/articles/${article.id}`}
              className="font-medium text-primary-dark hover:text-accent-dark"
            >
              {article.title}
            </Link>
            <p className="mt-1 text-xs text-primary/50">
              {formatDate(article.updatedAt)} · {article.author.name}
            </p>
          </div>
          <ArticleStatusBadge status={article.status} />
        </li>
      ))}
    </ul>
  );
}
