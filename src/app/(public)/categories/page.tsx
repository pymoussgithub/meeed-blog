import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCachedCategoriesWithPublishedCounts } from "@/lib/public-cache";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Domaines",
  description: "Parcourir les domaines thématiques du magazine MEEED.",
  path: "/categories",
});

function articleCountLabel(count: number) {
  if (count === 0) return "Aucun article";
  if (count === 1) return "1 article";
  return `${count} articles`;
}

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCachedCategoriesWithPublishedCounts>> = [];

  try {
    categories = await getCachedCategoriesWithPublishedCounts();
  } catch {
    // DB indisponible au build ou en local
  }

  const totalArticles = categories.reduce(
    (sum, category) => sum + category._count.articles,
    0,
  );

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Domaines", path: "/categories" },
  ]);

  return (
    <div className="container-meeed py-12">
      <JsonLd data={breadcrumb} />

      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">
          Thématiques
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Domaines</h1>
        <div className="mt-3 h-1 w-20 rounded-full bg-accent" />
        <p className="mt-5 text-base leading-relaxed text-primary/70 sm:text-lg">
          Explorez les sujets du magazine et accédez aux articles de chaque domaine.
        </p>
        {categories.length > 0 ? (
          <p className="mt-3 text-sm text-primary/55">
            {categories.length} domaine{categories.length > 1 ? "s" : ""}
            {" · "}
            {totalArticles} article{totalArticles !== 1 ? "s" : ""} publié
            {totalArticles !== 1 ? "s" : ""}
          </p>
        ) : null}
      </header>

      {categories.length === 0 ? (
        <p className="mt-10 text-primary/60">Aucun domaine disponible pour le moment.</p>
      ) : (
        <ul
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          data-tour-id="domaines.grid"
        >
          {categories.map((category) => {
            const count = category._count.articles;
            const color = category.color ?? "var(--color-accent)";

            return (
              <li key={category.id}>
                <Link
                  href={`/c/${category.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white transition-all hover:border-accent/40 hover:bg-bg-soft/30 hover:shadow-md"
                  data-tour-id="category.card"
                >
                  <span
                    className="block h-1.5 w-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <span className="flex flex-1 flex-col px-5 py-5" data-tour-id="domaines.card">
                    <span className="font-heading text-lg font-semibold text-primary-dark transition-colors group-hover:text-accent-dark">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span className="mt-2 flex-1 text-sm leading-relaxed text-primary/65 line-clamp-3">
                        {category.description}
                      </span>
                    ) : (
                      <span className="mt-2 flex-1" />
                    )}
                    <span className="mt-5 flex items-center justify-between gap-3 border-t border-primary/10 pt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium tabular-nums text-primary/65">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        {articleCountLabel(count)}
                      </span>
                      <span className="text-sm font-medium text-accent-dark transition-transform group-hover:translate-x-0.5">
                        Voir →
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
