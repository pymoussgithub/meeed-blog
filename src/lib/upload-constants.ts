export const UPLOAD_LIMITS = {
  imageMaxBytes: 10 * 1024 * 1024,
  documentMaxBytes: 25 * 1024 * 1024,
  imageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  documentMimeTypes: ["application/pdf"],
} as const;
