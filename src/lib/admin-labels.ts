export const ARTICLE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  PUBLISHED: "Publié",
  ARCHIVED: "Archivé",
};

export const ARTICLE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94979b",
  PUBLISHED: "#4ecdc4",
  ARCHIVED: "#292f36",
};

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  CONTRIBUTEUR: "Contributeur",
};

export const USER_ROLE_COLORS: Record<string, string> = {
  ADMIN: "#292f36",
  CONTRIBUTEUR: "#4ecdc4",
};

export const FORUM_TOPIC_STATUS_LABELS: Record<string, string> = {
  OPEN: "Ouvert",
  LOCKED: "Verrouillé",
  ARCHIVED: "Archivé",
};

export const FORUM_TOPIC_STATUS_COLORS: Record<string, string> = {
  OPEN: "#4ecdc4",
  LOCKED: "#e09f3e",
  ARCHIVED: "#94979b",
};

export const DOCUMENT_STATUS_LABELS = {
  ACTIVE: "Actif",
  ARCHIVED: "Archivé",
} as const;

export const DOCUMENT_STATUS_COLORS = {
  ACTIVE: "#4ecdc4",
  ARCHIVED: "#292f36",
} as const;
