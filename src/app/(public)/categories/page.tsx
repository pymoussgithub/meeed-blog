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
    <div className="container-meeed py-6 sm:py-8">
      <JsonLd data={breadcrumb} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <header>
          <h1 className="text-3xl sm:text-4xl">Domaines</h1>
          <div className="mt-2.5 h-1 w-14 rounded-full bg-accent" />
          <p className="mt-3 text-sm leading-relaxed text-primary/70">
            Explorez les sujets du magazine et accédez aux articles de chaque domaine.
          </p>
          {categories.length > 0 ? (
            <p className="mt-3 text-xs text-primary/50 sm:text-sm">
              {categories.length} domaine{categories.length > 1 ? "s" : ""}
              {" · "}
              {totalArticles} article{totalArticles !== 1 ? "s" : ""} publié
              {totalArticles !== 1 ? "s" : ""}
            </p>
          ) : null}
        </header>

        <div>
          {categories.length === 0 ? (
            <p className="text-primary/60">Aucun domaine disponible pour le moment.</p>
          ) : (
            <ul
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5"
              data-tour-id="domaines.grid"
            >
              {categories.map((category) => {
                const count = category._count.articles;
                const color = category.color ?? "var(--color-accent)";

                return (
                  <li key={category.id}>
                    <Link
                      href={`/c/${category.slug}`}
                      className="group flex h-full flex-col rounded-xl border border-primary/10 bg-bg-soft/40 p-3 transition-colors hover:border-accent/40 hover:bg-bg-soft/70"
                      data-tour-id="category.card"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span
                          className="font-heading text-sm font-bold leading-snug text-primary-dark transition-colors group-hover:text-accent-dark sm:text-[0.95rem]"
                          data-tour-id="domaines.card"
                        >
                          {category.name}
                        </span>
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                      </span>

                      {category.description ? (
                        <span className="mt-1.5 flex-1 text-xs leading-relaxed text-primary/65 line-clamp-2">
                          {category.description}
                        </span>
                      ) : (
                        <span className="mt-1.5 flex-1" />
                      )}

                      <span className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-primary/10 bg-white px-2.5 py-2 text-xs shadow-sm">
                        <span className="font-medium tabular-nums text-primary/70">
                          {articleCountLabel(count)}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-accent/15 px-2 py-0.5 font-semibold text-accent-dark transition-colors group-hover:bg-accent group-hover:text-white">
                          Lire
                          <span
                            aria-hidden
                            className="ml-0.5 inline-block transition-transform group-hover:translate-x-0.5"
                          >
                            →
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
      </div>
    </div>
  );
}
