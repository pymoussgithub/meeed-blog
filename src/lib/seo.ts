import type { Metadata } from "next";
import { getOgImageUrl } from "@/lib/cloudinary";

export const SITE_NAME = "MEEED";
export const SITE_DESCRIPTION =
  "Association loi 1901 d'intérêt général. Solutions innovantes pour un maraîchage efficient en eau et en énergie décarbonée.";

export const DEFAULT_OG_IMAGE = "/og-default.svg";

export function getSiteUrl() {
  return process.env.NEXTAUTH_URL ?? "https://meeed.fr";
}

export function absoluteUrl(path: string) {
  const base = getSiteUrl().replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type OgImageSource = {
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
};

export function getArticleOgImage(article: OgImageSource) {
  if (article.coverImagePublicId) {
    try {
      return getOgImageUrl(article.coverImagePublicId);
    } catch {
      // Cloudinary non configuré en local
    }
  }
  return article.coverImageUrl ?? DEFAULT_OG_IMAGE;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: SITE_NAME,
      locale: "fr_FR",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

type BreadcrumbItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl("/logo-meeed.png"),
    description: SITE_DESCRIPTION,
  };
}

type ArticleJsonLdInput = {
  title: string;
  excerpt: string;
  slug: string;
  coverImageUrl?: string | null;
  coverImagePublicId?: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
};

export function buildArticleJsonLd(article: ArticleJsonLdInput) {
  const image = getArticleOgImage(article);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [image],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo-meeed.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/a/${article.slug}`),
    },
  };
}
