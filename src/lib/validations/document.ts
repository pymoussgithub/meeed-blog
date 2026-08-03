import { z } from "zod";

const documentVisibilityValues = ["PUBLIC", "CONTRIBUTOR", "ADMIN"] as const;

/** Titre affiché en une ligne sur /documents. */
export const DOCUMENT_TITLE_MAX_LENGTH = 200;

/**
 * Descriptif affiché en 2 lignes max (`line-clamp-2`) sur /documents.
 * ~160 caractères = environ 2 lignes en text-sm sur desktop.
 */
export const DOCUMENT_DESCRIPTION_MAX_LENGTH = 160;

export const createDocumentSchema = z.object({
  title: z.string().min(2).max(DOCUMENT_TITLE_MAX_LENGTH),
  description: z.string().max(DOCUMENT_DESCRIPTION_MAX_LENGTH).optional().nullable(),
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024),
  mimeType: z.string().min(1).max(255).default("application/octet-stream"),
  cloudinaryPublicId: z.string().min(1),
  visibility: z.enum(documentVisibilityValues).default("PUBLIC"),
  isArchived: z.boolean().optional(),
  articleId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  uploadedById: z.string().cuid(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const updateDocumentMetaSchema = z.object({
  title: z.string().min(2).max(DOCUMENT_TITLE_MAX_LENGTH),
  description: z
    .string()
    .max(DOCUMENT_DESCRIPTION_MAX_LENGTH)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
  visibility: z.enum(documentVisibilityValues),
  articleId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().min(1).max(255).optional(),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024).optional(),
  mimeType: z.string().min(1).max(255).optional(),
  cloudinaryPublicId: z.string().min(1).optional(),
});

export type UpdateDocumentMetaInput = z.infer<typeof updateDocumentMetaSchema>;

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
