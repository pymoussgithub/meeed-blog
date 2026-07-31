import type { DocumentVisibility } from "@prisma/client";

export function getDocumentVisibilityLabel(visibility: DocumentVisibility) {
  switch (visibility) {
    case "PUBLIC":
      return "Tout le monde";
    case "CONTRIBUTOR":
      return "Contributeurs + admins";
    case "ADMIN":
      return "Admins uniquement";
  }
}
