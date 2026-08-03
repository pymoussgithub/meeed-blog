const INLINE_DOCUMENT_PREFIX = "meeed/documents/";

export function isAllowedInlineDocumentPublicId(publicId: string) {
  return (
    publicId.startsWith(INLINE_DOCUMENT_PREFIX) &&
    !publicId.includes("..") &&
    !publicId.includes("//") &&
    publicId.length <= 500
  );
}

export function getFileExtension(fileName: string) {
  const match = fileName.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() || "pdf";
}

export function buildInlineDocumentViewPath(publicId: string, format = "pdf") {
  const params = new URLSearchParams({
    publicId,
    format: format.replace(/^\./, "").trim().toLowerCase() || "pdf",
  });
  return `/api/documents/inline/view?${params.toString()}`;
}

/** Extrait le public_id d'une URL Cloudinary raw (documents inline). */
export function extractInlineDocumentPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return null;

    const marker = "/raw/upload/";
    const markerIndex = parsed.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const afterUpload = decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
    const segments = afterUpload.split("/").filter(Boolean);

    // Ignore version (v123) and transformation segments until meeed/...
    let start = 0;
    while (start < segments.length) {
      const segment = segments[start];
      if (segment.startsWith("meeed")) break;
      if (/^v\d+$/.test(segment) || segment.includes("_") || segment.includes(",")) {
        start += 1;
        continue;
      }
      break;
    }

    const publicId = segments.slice(start).join("/");
    if (!isAllowedInlineDocumentPublicId(publicId)) return null;
    return publicId;
  } catch {
    return null;
  }
}

/**
 * Réécrit les href Cloudinary raw (bloqués pour les PDF) vers la route
 * d'accès signée de l'app — corrige les contenus déjà publiés.
 */
export function rewriteCloudinaryRawDocumentLinks(html: string) {
  return html.replace(
    /(<a\b[^>]*\bhref=["'])(https?:\/\/res\.cloudinary\.com\/[^"']+)(["'][^>]*>)/gi,
    (full, prefix: string, href: string, suffix: string) => {
      const publicId = extractInlineDocumentPublicId(href);
      if (!publicId) return full;

      const format = getFileExtension(publicId.includes(".") ? publicId : href);
      const viewPath = buildInlineDocumentViewPath(publicId, format);
      return `${prefix}${viewPath}${suffix}`;
    },
  );
}
