import { Button } from "@/components/ui/Button";
import type { CarouselArticle } from "@/lib/article-carousel";
import { NewsArticlesCarousel } from "@/components/home/NewsArticlesCarousel";

type HomeHeroProps = {
  articles: CarouselArticle[];
};

export function HomeHero({ articles }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-bg-soft/80 via-white to-white">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-accent-blue/10 blur-3xl"
        aria-hidden
      />

      <div className="container-meeed relative py-6 sm:py-8 lg:py-12">
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-dark">
              Association loi 1901 d&apos;intérêt général
            </span>
            <h1 className="mt-3 text-2xl leading-snug break-words sm:mt-4 sm:text-3xl sm:leading-tight lg:text-4xl lg:leading-[1.15]">
              Maraichage Efficient en Eau et en Energie Décarbonée
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary/70 sm:mt-4 sm:text-base lg:text-lg">
              Solutions innovantes pour un maraîchage efficient en eau et en énergie
              décarbonée. Retrouvez nos actualités, projets et documents pour la transition
              agricole.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-6">
              <Button href="/actualites" variant="accent">
                Nos articles
              </Button>
              <Button href="/projets" variant="outline">
                Nos projets
              </Button>
            </div>
          </div>

          <NewsArticlesCarousel articles={articles} />
        </div>
      </div>
    </section>
  );
}
