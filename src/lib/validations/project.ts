import { z } from "zod";

const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide");

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex invalide")
  .optional()
  .nullable();

const donationUrlSchema = z
  .string()
  .url("URL invalide")
  .optional()
  .nullable()
  .or(z.literal(""));

export const createProjectSchema = z.object({
  title: z.string().min(2, "Titre requis").max(120),
  slug: slugSchema,
  summary: z.string().min(10, "Résumé trop court").max(500),
  description: z.string().max(5000).optional().nullable(),
  donationUrl: donationUrlSchema,
  coverImageUrl: z.string().url().nullish(),
  coverImagePublicId: z.string().nullish(),
  color: colorSchema,
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
