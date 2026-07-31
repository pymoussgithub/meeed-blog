import { z } from "zod";
import { isHtmlContentEmpty } from "@/lib/editor-utils";

export const forumTopicStatusSchema = z.enum(["OPEN", "LOCKED", "ARCHIVED"]);

export const forumTopicSortSchema = z.enum([
  "recent",
  "created",
  "replies",
]);

export type ForumTopicSort = z.infer<typeof forumTopicSortSchema>;

const FIELD_LABELS: Record<string, string> = {
  title: "Le titre",
  slug: "L'URL (slug)",
  body: "Le message",
  categoryId: "La rubrique",
  name: "Le nom",
  description: "La description",
};

function requiredText(message: string) {
  return z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().min(1, message),
  );
}

export function getFirstForumZodError(error: z.ZodError): string {
  const issue = error.errors[0];
  if (!issue) return "Données invalides";

  if (!issue.message.startsWith("Expected")) {
    return issue.message;
  }

  const field = String(issue.path[0] ?? "");
  const label = FIELD_LABELS[field] ?? field;

  if (issue.code === "invalid_type" && issue.received === "null") {
    return `${label} est requis`;
  }

  return issue.message;
}

const slugSchema = requiredText("Le slug est requis").pipe(
  z
    .string()
    .min(2, "Le slug doit contenir au moins 2 caractères")
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules et tirets uniquement)"),
);

const bodySchema = requiredText("Le message est requis").refine(
  (html) => !isHtmlContentEmpty(html),
  "Le message ne peut pas être vide",
);

export const createForumCategorySchema = z.object({
  name: requiredText("Le nom est requis").pipe(
    z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  ),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateForumCategorySchema = createForumCategorySchema.partial();

export const reorderForumCategoriesSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const createForumTopicSchema = z.object({
  title: requiredText("Le titre est requis").pipe(
    z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200),
  ),
  slug: slugSchema.optional(),
  categoryId: z.string().cuid("Rubrique invalide"),
  body: bodySchema,
  articleIds: z
    .array(z.string().cuid("Article invalide"))
    .max(20, "Trop d’articles associés")
    .optional()
    .default([]),
});

export const updateForumTopicSchema = z.object({
  title: requiredText("Le titre est requis")
    .pipe(z.string().min(3).max(200))
    .optional(),
  categoryId: z.string().cuid().optional(),
  status: forumTopicStatusSchema.optional(),
  isPinned: z.boolean().optional(),
});

export const createForumPostSchema = z.object({
  topicId: z.string().cuid("Sujet invalide"),
  body: bodySchema,
});

export const updateForumPostSchema = z.object({
  body: bodySchema,
});

export const forumIdSchema = z.string().cuid("Identifiant invalide");

export type CreateForumCategoryInput = z.infer<typeof createForumCategorySchema>;
export type UpdateForumCategoryInput = z.infer<typeof updateForumCategorySchema>;
export type ReorderForumCategoriesInput = z.infer<typeof reorderForumCategoriesSchema>;
export type CreateForumTopicInput = z.infer<typeof createForumTopicSchema>;
export type UpdateForumTopicInput = z.infer<typeof updateForumTopicSchema>;
export type CreateForumPostInput = z.infer<typeof createForumPostSchema>;
export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>;
