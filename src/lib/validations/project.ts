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
  categoryId: z.string().cuid("Catégorie requise"),
});

export const updateProjectSchema = createProjectSchema.partial();

export const reorderProjectsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const projectFormSchema = createProjectSchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFormInput = z.infer<typeof projectFormSchema>;
export type ReorderProjectsInput = z.infer<typeof reorderProjectsSchema>;

export function normalizeProjectFormInput(
  input: Partial<ProjectFormInput> & Record<string, unknown>,
): ProjectFormInput {
  return {
    title: typeof input.title === "string" ? input.title : "",
    slug: typeof input.slug === "string" ? input.slug : "",
    summary: typeof input.summary === "string" ? input.summary : "",
    description: typeof input.description === "string" ? input.description : null,
    donationUrl: typeof input.donationUrl === "string" ? input.donationUrl : null,
    coverImageUrl: typeof input.coverImageUrl === "string" ? input.coverImageUrl : null,
    coverImagePublicId:
      typeof input.coverImagePublicId === "string" ? input.coverImagePublicId : null,
    color: typeof input.color === "string" ? input.color : "#4ecdc4",
    sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : 0,
    isActive: typeof input.isActive === "boolean" ? input.isActive : true,
    categoryId: typeof input.categoryId === "string" ? input.categoryId : "",
  };
}
