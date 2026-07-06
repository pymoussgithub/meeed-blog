export type ImageMetadata = {
  publicId: string;
  url: string;
  articleId?: string;
  projectId?: string;
  purpose: "cover" | "inline" | "project-cover";
};

export type DocumentMetadata = {
  publicId: string;
  url: string;
  fileName: string;
  fileSize: number;
  articleId?: string;
};

export function saveImageMetadata(
  publicId: string,
  url: string,
  options?: {
    articleId?: string;
    projectId?: string;
    purpose?: "cover" | "inline" | "project-cover";
  },
): ImageMetadata {
  return {
    publicId,
    url,
    articleId: options?.articleId,
    projectId: options?.projectId,
    purpose: options?.purpose ?? "cover",
  };
}

export function saveDocumentMetadata(
  publicId: string,
  url: string,
  fileName: string,
  fileSize: number,
  articleId?: string,
): DocumentMetadata {
  return {
    publicId,
    url,
    fileName,
    fileSize,
    articleId,
  };
}
