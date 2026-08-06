/** Recherche / téléchargement d’images libres via Pexels. */

import { Agent } from "undici";
import type { StockImage, StockImageSearchResult } from "@/lib/stock-images-shared";

export type { StockImage, StockImageSearchResult } from "@/lib/stock-images-shared";
export { STOCK_IMAGE_SUGGESTIONS } from "@/lib/stock-images-shared";

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";
const USER_AGENT = "MEEED/1.0 (https://meeed.fr; stock cover picker)";

function getPexelsApiKey() {
  const key = process.env.PEXELS_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Configurez PEXELS_API_KEY pour utiliser la bibliothèque d'images (https://www.pexels.com/api/).",
    );
  }
  return key;
}

function shouldRejectUnauthorizedTls() {
  const raw = process.env.STOCK_IMAGES_TLS_REJECT_UNAUTHORIZED;
  if (raw === "false" || raw === "0") return false;
  if (raw === "true" || raw === "1") return true;
  // En local, les antivirus Windows injectent souvent un certificat auto-signé.
  return process.env.NODE_ENV === "production";
}

const insecureAgent = new Agent({
  connect: { rejectUnauthorized: false },
});

function stockFetch(input: string | URL, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", USER_AGENT);
  }

  return fetch(input, {
    ...init,
    headers,
    ...(shouldRejectUnauthorizedTls() ? {} : { dispatcher: insecureAgent }),
  });
}

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  alt?: string | null;
  photographer?: string | null;
  photographer_url?: string | null;
  src: {
    original: string;
    large2x?: string;
    large?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };
};

type PexelsSearchResponse = {
  page?: number;
  per_page?: number;
  total_results?: number;
  photos?: PexelsPhoto[];
};

function mapPexelsPhoto(photo: PexelsPhoto): StockImage {
  const title = photo.alt?.trim() || `Photo Pexels #${photo.id}`;
  const photographer = photo.photographer?.trim() || null;

  return {
    id: String(photo.id),
    title,
    thumbnailUrl: photo.src.medium || photo.src.large || photo.src.original,
    fullUrl: photo.src.large2x || photo.src.large || photo.src.original,
    width: photo.width ?? null,
    height: photo.height ?? null,
    creator: photographer,
    license: "Pexels",
    licenseUrl: "https://www.pexels.com/license/",
    foreignLandingUrl: photo.url || null,
    attribution: photographer
      ? `Photo by ${photographer} on Pexels`
      : "Photo from Pexels",
  };
}

export async function searchStockImages(params: {
  query: string;
  page?: number;
  pageSize?: number;
}): Promise<StockImageSearchResult> {
  const query = params.query.trim();
  if (!query) {
    return { page: 1, pageCount: 0, resultCount: 0, results: [] };
  }

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(40, Math.max(1, params.pageSize ?? 20));
  const apiKey = getPexelsApiKey();

  const url = new URL(PEXELS_SEARCH_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(pageSize));
  url.searchParams.set("orientation", "landscape");

  const response = await stockFetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: apiKey,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Clé Pexels invalide ou refusée. Vérifiez PEXELS_API_KEY.");
  }

  if (!response.ok) {
    throw new Error("Impossible de contacter la bibliothèque Pexels.");
  }

  const data = (await response.json()) as PexelsSearchResponse;
  const results = (data.photos ?? []).map(mapPexelsPhoto);
  const resultCount = data.total_results ?? results.length;
  const pageCount = Math.max(1, Math.ceil(resultCount / pageSize));

  return {
    page: data.page ?? page,
    pageCount: resultCount === 0 ? 0 : pageCount,
    resultCount,
    results,
  };
}

const ALLOWED_DOWNLOAD_HOST_SUFFIXES = [
  "images.pexels.com",
  "pexels.com",
  "staticflickr.com",
  "flickr.com",
  "wikimedia.org",
  "wikipedia.org",
  "openverse.org",
  "unsplash.com",
  "amazonaws.com",
  "cloudfront.net",
];

export function isAllowedStockImageUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_DOWNLOAD_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

export async function downloadStockImage(rawUrl: string): Promise<{
  buffer: ArrayBuffer;
  contentType: string;
  filename: string;
}> {
  if (!isAllowedStockImageUrl(rawUrl)) {
    throw new Error("URL d'image non autorisée.");
  }

  const response = await stockFetch(rawUrl, { redirect: "follow" });

  if (!response.ok) {
    throw new Error("Impossible de télécharger l'image sélectionnée.");
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Le fichier téléchargé n'est pas une image.");
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error("Image vide.");
  }

  if (buffer.byteLength > 12 * 1024 * 1024) {
    throw new Error("Image trop volumineuse (max 12 Mo).");
  }

  const extension =
    contentType === "image/png"
      ? "png"
      : contentType === "image/webp"
        ? "webp"
        : contentType === "image/gif"
          ? "gif"
          : "jpg";

  return {
    buffer,
    contentType,
    filename: `stock-cover.${extension}`,
  };
}
