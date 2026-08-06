import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCategoriesForAdmin } from "@/lib/services/category.service";

export default async function AdminCategoriesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin");
  }

  const categories = await getCategoriesForAdmin();

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Domaines</h1>
          <p className="mt-1 text-sm text-primary/60">
            {categories.length} domaine{categories.length > 1 ? "s" : ""} · organisez
            l’ordre par glisser-déposer
          </p>
        </div>
        <Button href="/admin/categories?new=1" variant="accent" data-tour-id="admin.domaines.new-button">
          + Nouveau domaine
        </Button>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-gray-100" />}>
          <CategoriesManager categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
