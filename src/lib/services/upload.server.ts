import {
  deleteFromCloudinary,
  type CloudinaryResourceType,
  getCloudinaryUrl,
  getOgImageUrl,
} from "@/lib/cloudinary";

export function getImageVariants(publicId: string) {
  return {
    original: getCloudinaryUrl(publicId),
    card: getCloudinaryUrl(publicId, { width: 400, height: 225 }),
    hero: getCloudinaryUrl(publicId, { width: 1200, height: 675 }),
    og: getOgImageUrl(publicId),
    thumb: getCloudinaryUrl(publicId, { width: 150, height: 150 }),
  };
}

export async function removeCloudinaryAsset(
  publicId: string,
  resourceType: CloudinaryResourceType,
) {
  return deleteFromCloudinary(publicId, resourceType);
}
