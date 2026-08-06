import { HomeHero } from "@/components/home/HomeHero";
import { HomeWelcome } from "@/components/home/HomeWelcome";
import { JsonLd } from "@/components/seo/JsonLd";
import { toCarouselArticle } from "@/lib/article-carousel";
import { getCachedHomeNews } from "@/lib/public-cache";
import { buildOrganizationJsonLd } from "@/lib/seo";

export const revalidate = 60;

export default async function HomePage() {
  let carouselArticles: ReturnType<typeof toCarouselArticle>[] = [];

  try {
    const newsArticles = await getCachedHomeNews();
    carouselArticles = newsArticles.map((article) => toCarouselArticle(article));
  } catch {
    // DB / cache indisponible — on affiche le hero sans carousel.
  }

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />

      <HomeHero articles={carouselArticles} />
      <HomeWelcome />
    </>
  );
}
