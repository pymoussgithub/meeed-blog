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
  if (count === 0) return "Aucun article publié";
  if (count === 1) return "1 article à lire";
  return `${count} articles à lire`;
}

function articleCtaLabel(count: number) {
  if (count === 0) return "Découvrir le domaine";
  if (count === 1) return "Lire l'article";
  return "Voir les articles";
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
    <div className="container-meeed py-8 sm:py-10">
      <JsonLd data={breadcrumb} />

      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">Domaines</h1>
        <div className="mt-2.5 h-1 w-14 rounded-full bg-accent" />
        <p className="mt-4 text-base leading-relaxed text-primary/75">
          Chaque domaine ouvre sur les articles du magazine. Choisissez un sujet pour
          parcourir les contenus publiés.
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

      <div className="mt-8 sm:mt-10">
        {categories.length === 0 ? (
          <p className="text-primary/60">Aucun domaine disponible pour le moment.</p>
        ) : (
          <ul
            className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            data-tour-id="domaines.grid"
          >
            {categories.map((category) => {
              const count = category._count.articles;
              const color = category.color ?? "var(--color-accent)";
              const hasArticles = count > 0;

              return (
                <li key={category.id}>
                  <Link
                    href={`/c/${category.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-primary/10 bg-bg-soft/35 p-5 transition-all hover:-translate-y-0.5 hover:border-accent/45 hover:bg-bg-soft/70 hover:shadow-md sm:p-6"
                    data-tour-id="category.card"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span
                        className="font-heading text-lg font-bold leading-snug text-primary-dark transition-colors group-hover:text-accent-dark sm:text-xl"
                        data-tour-id="domaines.card"
                      >
                        {category.name}
                      </span>
                      <span
                        className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                    </span>

                    {category.description ? (
                      <span className="mt-3 flex-1 text-sm leading-relaxed text-primary/75 sm:text-[0.95rem] sm:leading-relaxed">
                        {category.description}
                      </span>
                    ) : (
                      <span className="mt-3 flex-1" />
                    )}

                    <span className="mt-5 flex flex-col gap-2.5 border-t border-primary/10 pt-4">
                      <span
                        className={`text-sm font-medium tabular-nums ${
                          hasArticles ? "text-primary/80" : "text-primary/50"
                        }`}
                      >
                        {articleCountLabel(count)}
                      </span>
                      <span className="inline-flex w-full items-center justify-between gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors group-hover:bg-accent-dark">
                        {articleCtaLabel(count)}
                        <span
                          aria-hidden
                          className="inline-block transition-transform group-hover:translate-x-0.5"
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
  );
}
