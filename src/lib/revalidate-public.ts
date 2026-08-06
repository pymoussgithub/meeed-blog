import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

type RevalidatePublicOptions = {
  articleSlug?: string | null;
  categorySlugs?: string[];
};

/** Invalide listes publiques, compteurs domaines et pages liées. */
export function revalidatePublicContent(options: RevalidatePublicOptions = {}) {
  revalidateTag(PUBLIC_CACHE_TAGS.homeNews);
  revalidateTag(PUBLIC_CACHE_TAGS.allCategories);
  revalidateTag(PUBLIC_CACHE_TAGS.categoriesWithCounts);
  revalidateTag(PUBLIC_CACHE_TAGS.articleAuthors);
  revalidateTag(PUBLIC_CACHE_TAGS.actualitesListing);

  revalidatePath("/");
  revalidatePath("/actualites");
  revalidatePath("/categories");
  revalidatePath("/recherche");

  if (options.articleSlug) {
    revalidatePath(`/a/${options.articleSlug}`);
  }

  for (const slug of options.categorySlugs ?? []) {
    if (slug) revalidatePath(`/c/${slug}`);
  }
}
