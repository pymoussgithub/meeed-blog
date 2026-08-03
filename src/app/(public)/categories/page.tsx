import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCachedAllCategories } from "@/lib/public-cache";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Catégories",
  description: "Parcourir les catégories thématiques du magazine MEEED.",
  path: "/categories",
});

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCachedAllCategories>> = [];

  try {
    categories = await getCachedAllCategories();
  } catch {
    // DB indisponible au build ou en local
  }

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Catégories", path: "/categories" },
  ]);

  return (
    <div className="container-meeed py-12">
      <JsonLd data={breadcrumb} />

      <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">
        Thématiques
      </p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Catégories</h1>
      <p className="mt-4 max-w-2xl text-primary/70">
        Explorez les sujets du magazine et accédez aux articles de chaque catégorie.
      </p>

      {categories.length === 0 ? (
        <p className="mt-10 text-primary/60">Aucune catégorie disponible pour le moment.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/c/${category.slug}`}
                className="block rounded-2xl border border-primary/10 bg-white px-5 py-5 transition-colors hover:border-accent/40 hover:bg-bg-soft/40"
                data-tour-id="category.card"
              >
                <span
                  className="mb-3 inline-block h-2 w-10 rounded-full"
                  style={{ backgroundColor: category.color ?? "var(--color-accent)" }}
                  aria-hidden
                />
                <span className="block text-lg font-semibold text-primary">{category.name}</span>
                {category.description ? (
                  <span className="mt-2 block text-sm text-primary/65 line-clamp-3">
                    {category.description}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
