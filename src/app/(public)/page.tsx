import { HomeHero } from "@/components/home/HomeHero";
import { HomeWelcome } from "@/components/home/HomeWelcome";
import { JsonLd } from "@/components/seo/JsonLd";
import { toCarouselArticle } from "@/lib/article-carousel";
import { getFilteredPublishedArticles } from "@/lib/services/article.service";
import { buildOrganizationJsonLd } from "@/lib/seo";

export default async function HomePage() {
  const newsArticles = await getFilteredPublishedArticles({ contentType: "news" }, 5, 0);
  const carouselArticles = newsArticles.map(toCarouselArticle);

  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />

      <HomeHero articles={carouselArticles} />
      <HomeWelcome />
    </>
  );
}
