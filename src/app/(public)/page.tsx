import { HomeHero } from "@/components/home/HomeHero";
import { HomeWelcome } from "@/components/home/HomeWelcome";
import { JsonLd } from "@/components/seo/JsonLd";
import { toCarouselArticle } from "@/lib/article-carousel";
import { getCachedHomeNews } from "@/lib/public-cache";
import { buildOrganizationJsonLd } from "@/lib/seo";

export const revalidate = 60;

export default async function HomePage() {
  const newsArticles = await getCachedHomeNews();
  const carouselArticles = newsArticles.map((article) => toCarouselArticle(article));

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />

      <HomeHero articles={carouselArticles} />
      <HomeWelcome />
    </>
  );
}
