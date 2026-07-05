import { ArticleCompactCard } from "@/components/articles/ArticleCompactCard";
import { getArticleKind } from "@/lib/articles-listing";
import type { ArticleWithRelations } from "@/lib/services/article.service";

type ArticlesSectionsProps = {
  articles: ArticleWithRelations[];
  showSections: boolean;
};

function ArticleGrid({ articles }: { articles: ArticleWithRelations[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {articles.map((article) => (
        <ArticleCompactCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export function ArticlesSections({ articles, showSections }: ArticlesSectionsProps) {
  if (!showSections) {
    return <ArticleGrid articles={articles} />;
  }

  const newsArticles = articles.filter((a) => getArticleKind(a) !== "project");
  const projectArticles = articles.filter((a) => getArticleKind(a) === "project");

  return (
    <div className="space-y-10">
      {newsArticles.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-dark">
              Actualités
            </h2>
            <span className="h-px flex-1 bg-accent/20" />
            <span className="text-xs tabular-nums text-primary/40">{newsArticles.length}</span>
          </div>
          <ArticleGrid articles={newsArticles} />
        </section>
      ) : null}

      {projectArticles.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary/50">
              Par thématique
            </h2>
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs tabular-nums text-primary/40">{projectArticles.length}</span>
          </div>
          <ArticleGrid articles={projectArticles} />
        </section>
      ) : null}
    </div>
  );
}
