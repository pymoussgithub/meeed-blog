/** Types et constantes partagés (safe côté client). */

export type StockImage = {
  id: string;
  title: string;
  thumbnailUrl: string;
  fullUrl: string;
  width: number | null;
  height: number | null;
  creator: string | null;
  license: string;
  licenseUrl: string | null;
  foreignLandingUrl: string | null;
  attribution: string | null;
};

export type StockImageSearchResult = {
  page: number;
  pageCount: number;
  resultCount: number;
  results: StockImage[];
};

export const STOCK_IMAGE_SUGGESTIONS = [
  "éducation",
  "école",
  "enfants",
  "communauté",
  "nature",
  "technologie",
  "agriculture",
  "livre",
] as const;
