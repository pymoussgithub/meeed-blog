import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ForumSortLinks } from "@/components/forum/ForumSortLinks";
import { ForumTopicList } from "@/components/forum/ForumTopicList";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { FORUM_PAGE_SIZE, parseForumPage, parseForumSort } from "@/lib/forum-listing";
import { getForumCategoryBySlug } from "@/lib/services/forum-category.service";
import {
  countForumTopicsByCategorySlug,
  getForumTopicsByCategorySlug,
} from "@/lib/services/forum-topic.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const category = await getForumCategoryBySlug(slug);

    if (!category || !category.isActive) {
      return { title: "Rubrique introuvable" };
    }

    return buildPageMetadata({
      title: `${category.name} — Forum`,
      description:
        category.description ?? `Discussions de la rubrique ${category.name} sur le forum MEEED.`,
      path: `/forum/r/${category.slug}`,
    });
  } catch {
    return { title: "Rubrique forum" };
  }
}

export default async function ForumCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const rawSearch = await searchParams;
  const currentPage = parseForumPage(rawSearch.page);
  const sort = parseForumSort(rawSearch.sort);
  const offset = (currentPage - 1) * FORUM_PAGE_SIZE;

  const category = await getForumCategoryBySlug(slug);
  if (!category || !category.isActive) {
    notFound();
  }

  const [topics, total] = await Promise.all([
    getForumTopicsByCategorySlug(slug, {
      limit: FORUM_PAGE_SIZE,
      offset,
      sort,
    }),
    countForumTopicsByCategorySlug(slug),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / FORUM_PAGE_SIZE));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
    { name: category.name, path: `/forum/r/${category.slug}` },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />

      <ForumToolbar
        backHref="/forum"
        newTopicHref={`/forum/nouveau?rubrique=${category.slug}`}
      />

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-lg font-bold sm:text-xl">{category.name}</h1>
          {category.description ? (
            <p className="mt-0.5 text-xs text-primary/55">{category.description}</p>
          ) : null}
        </div>
        <ForumSortLinks basePath={`/forum/r/${category.slug}`} currentSort={sort} />
      </div>

      <ForumTopicList
        topics={topics}
        emptyMessage="Aucun sujet dans cette rubrique pour le moment."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/forum/r/${category.slug}`}
        query={{ sort: sort === "recent" ? undefined : sort }}
      />
    </div>
  );
}
