import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { getCategoriesForAdmin } from "@/lib/services/category.service";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesForAdmin();

  return (
    <div className="container-meeed py-10">
      <h1 className="text-2xl font-bold">Catégories</h1>
      <p className="mt-2 text-primary/70">Organisez les articles par thématique.</p>
      <div className="mt-8">
        <CategoriesManager categories={categories} />
      </div>
    </div>
  );
}
