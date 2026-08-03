import { v2 as cloudinary } from "cloudinary";

export type CloudinaryResourceType = "image" | "raw";

function getCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Variables Cloudinary manquantes (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).",
    );
  }

  return { cloud_name, api_key, api_secret };
}

export function configureCloudinary() {
  const config = getCloudinaryConfig();
  cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret,
    secure: true,
  });
  return config;
}

export function getCloudinaryPublicConfig() {
  const { cloud_name, api_key } = getCloudinaryConfig();
  return { cloudName: cloud_name, apiKey: api_key };
}

export function buildImageFolder(purpose: "cover" | "inline", articleId?: string) {
  const id = articleId ?? "draft";
  return purpose === "cover"
    ? `meeed/articles/covers/${id}`
    : `meeed/articles/inline/${id}`;
}

export function buildProjectImageFolder(projectId?: string) {
  return `meeed/projects/covers/${projectId ?? "draft"}`;
}

export function buildDocumentFolder(documentId?: string) {
  return `meeed/documents/${documentId ?? "draft"}`;
}

export function createSignedUploadParams(
  folder: string,
  extraParams: Record<string, string | number> = {},
) {
  const { api_secret } = configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);

  const params: Record<string, string | number> = {
    timestamp,
    folder,
    ...extraParams,
  };

  const signature = cloudinary.utils.api_sign_request(params, api_secret);

  return {
    signature,
    timestamp,
    folder,
    params,
  };
}

type TransformOptions = {
  width?: number;
  height?: number;
  crop?: string;
  format?: string;
};

export function getCloudinaryUrl(publicId: string, options: TransformOptions = {}) {
  configureCloudinary();

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop ?? "fill",
        quality: "auto",
        fetch_format: options.format ?? "auto",
      },
    ],
  });
}

export function getOgImageUrl(publicId: string) {
  return getCloudinaryUrl(publicId, {
    width: 1200,
    height: 630,
    crop: "fill",
    format: "jpg",
  });
}

export function getCoverCardUrl(publicId: string) {
  return getCloudinaryUrl(publicId, { width: 480, height: 300, crop: "fit" });
}

export function getCoverHeroUrl(publicId: string) {
  return getCloudinaryUrl(publicId, { width: 1200, height: 675 });
}

export function getCoverProjectUrl(publicId: string) {
  return getCloudinaryUrl(publicId, { width: 960, height: 600, crop: "fit" });
}

function normalizeDocumentFormat(format?: string) {
  const normalized = format?.replace(/^\./, "").trim().toLowerCase();
  return normalized || "pdf";
}

/** URL de téléchargement signée (contourne la restriction livraison PDF Cloudinary). */
export function getDocumentDownloadUrl(publicId: string, format = "pdf") {
  configureCloudinary();

  return cloudinary.utils.private_download_url(publicId, normalizeDocumentFormat(format), {
    resource_type: "raw",
    type: "upload",
    attachment: true,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  });
}

/** URL signée pour consulter le PDF dans le navigateur (sans forcer le téléchargement). */
export function getDocumentViewUrl(publicId: string, format = "pdf") {
  configureCloudinary();

  return cloudinary.utils.private_download_url(publicId, normalizeDocumentFormat(format), {
    resource_type: "raw",
    type: "upload",
    attachment: false,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  resourceType: CloudinaryResourceType = "image",
) {
  configureCloudinary();
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export async function pingCloudinary() {
  configureCloudinary();
  return cloudinary.api.ping();
}
