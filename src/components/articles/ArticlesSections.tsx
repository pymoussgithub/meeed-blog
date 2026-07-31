import { CollapsibleArticlesSection } from "@/components/articles/CollapsibleArticlesSection";
import { NewsArticlesCarouselStrip } from "@/components/articles/NewsArticlesCarouselStrip";
import type { CarouselArticle } from "@/lib/article-carousel";

export type ArticlesCategorySection = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  count: number;
  articles: CarouselArticle[];
};

type ArticlesSectionsProps = {
  sections: ArticlesCategorySection[];
  returnTo?: string;
};

export function ArticlesSections({ sections, returnTo }: ArticlesSectionsProps) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <CollapsibleArticlesSection
          key={section.id}
          title={section.name}
          count={section.count}
          href={`/c/${section.slug}`}
          color={section.color}
        >
          <NewsArticlesCarouselStrip
            articles={section.articles}
            returnTo={returnTo}
            label={section.name}
          />
        </CollapsibleArticlesSection>
      ))}
    </div>
  );
}
