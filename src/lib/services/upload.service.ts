export type ImageMetadata = {
  publicId: string;
  url: string;
  articleId?: string;
  purpose: "cover" | "inline";
};

export type DocumentMetadata = {
  publicId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  articleId?: string;
};

export function saveImageMetadata(
  publicId: string,
  url: string,
  options?: {
    articleId?: string;
    purpose?: "cover" | "inline";
  },
): ImageMetadata {
  return {
    publicId,
    url,
    articleId: options?.articleId,
    purpose: options?.purpose ?? "cover",
  };
}

export function saveDocumentMetadata(
  publicId: string,
  url: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  articleId?: string,
): DocumentMetadata {
  return {
    publicId,
    url,
    fileName,
    fileSize,
    mimeType,
    articleId,
  };
}
