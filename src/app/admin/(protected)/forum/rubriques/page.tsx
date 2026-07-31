import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ForumCategoriesManager } from "@/components/admin/ForumCategoriesManager";
import { ForumCategoriesToolbar } from "@/components/admin/ForumCategoriesToolbar";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth-helpers";
import { getForumCategoriesForAdmin } from "@/lib/services/forum-category.service";

type PageProps = {
  searchParams: Promise<{
    visibility?: string;
    q?: string;
    new?: string;
    edit?: string;
  }>;
};

export default async function AdminForumCategoriesPage({ searchParams }: PageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin");
  }

  const params = await searchParams;
  const allCategories = await getForumCategoriesForAdmin();

  const stats = {
    total: allCategories.length,
    active: allCategories.filter((category) => category.isActive).length,
    hidden: allCategories.filter((category) => !category.isActive).length,
  };

  const query = params.q?.trim().toLowerCase() ?? "";
  const visibility = params.visibility ?? "";
  const canReorder = !query && !visibility;

  const categories = allCategories.filter((category) => {
    if (visibility === "active" && !category.isActive) return false;
    if (visibility === "hidden" && category.isActive) return false;

    if (!query) return true;

    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      (category.description?.toLowerCase().includes(query) ?? false)
    );
  });

  const createHref = (() => {
    const next = new URLSearchParams();
    if (params.visibility) next.set("visibility", params.visibility);
    if (params.q) next.set("q", params.q);
    next.set("new", "1");
    return `/admin/forum/rubriques?${next.toString()}`;
  })();

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1">
            <Link
              href="/admin/forum"
              className="text-sm text-primary/60 hover:text-accent-dark hover:underline"
            >
              ← Modération forum
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">Rubriques forum</h1>
          <p className="mt-1 text-sm text-primary/60">
            {categories.length} résultat{categories.length > 1 ? "s" : ""}
            {params.q ? ` pour « ${params.q} »` : ""}
            {canReorder ? " · organisez l’ordre par glisser-déposer" : ""}
          </p>
        </div>
        <Button href={createHref} variant="accent">
          + Nouvelle rubrique
        </Button>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-32 animate-pulse rounded-xl bg-gray-100" />}>
          <ForumCategoriesToolbar stats={stats} />
        </Suspense>
      </div>

      <div className="mt-6">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-gray-100" />}>
          <ForumCategoriesManager
            categories={categories}
            allCategories={allCategories}
            canReorder={canReorder}
          />
        </Suspense>
      </div>
    </div>
  );
}
