import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(500).optional().nullable(),
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024),
  mimeType: z.literal("application/pdf").default("application/pdf"),
  cloudinaryPublicId: z.string().min(1),
  isPublic: z.boolean().default(true),
  articleId: z.string().cuid().optional().nullable(),
  projectId: z.string().cuid().optional().nullable(),
  uploadedById: z.string().cuid(),
});

export const updateDocumentSchema = createDocumentSchema.partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
