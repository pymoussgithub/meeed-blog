"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

type ArticleCategoryFilterProps = {
  categories: Category[];
  basePath?: string;
};

export function ArticleCategoryFilter({
  categories,
  basePath = "/actualites",
}: ArticleCategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get("category");

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => setCategory(null)} className="cursor-pointer">
        <Badge
          className={cn(
            "transition-shadow",
            !activeSlug && "ring-2 ring-accent ring-offset-1",
          )}
        >
          Tous
        </Badge>
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => setCategory(category.slug)}
          className="cursor-pointer"
        >
          <Badge
            color={category.color ?? undefined}
            className={cn(
              "transition-shadow",
              activeSlug === category.slug && "ring-2 ring-accent ring-offset-1",
            )}
          >
            {category.name}
          </Badge>
        </button>
      ))}
    </div>
  );
}
