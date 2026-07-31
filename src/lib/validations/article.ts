import { z } from "zod";
import { isHtmlContentEmpty } from "@/lib/editor-utils";

export const articleStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

const FIELD_LABELS: Record<string, string> = {
  title: "Le titre",
  slug: "L'URL (slug)",
  excerpt: "L'extrait",
  content: "Le contenu",
  coverImageUrl: "L'image de couverture",
  projectId: "Le projet",
  categoryIds: "Les thématiques",
};

function requiredText(message: string) {
  return z.preprocess(
    (value) => (value == null ? "" : value),
    z.string().min(1, message),
  );
}

export function getFirstZodErrorMessage(error: z.ZodError): string {
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

function withClassificationRefine<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data: z.infer<T>, ctx) => {
    const projectId = (data as { projectId?: string | null }).projectId;
    const categoryIds = (data as { categoryIds?: string[] }).categoryIds ?? [];
    if (!projectId && categoryIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sélectionnez un projet ou au moins une thématique",
        path: ["projectId"],
      });
    }
  });
}

const articleFields = {
  title: requiredText("Le titre est requis").pipe(
    z.string().min(3, "Le titre doit contenir au moins 3 caractères").max(200),
  ),
  slug: requiredText("Le slug est requis").pipe(
    z
      .string()
      .min(3, "Le slug doit contenir au moins 3 caractères")
      .max(80)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (minuscules et tirets uniquement)"),
  ),
  excerpt: requiredText("L'extrait est requis").pipe(
    z.string().min(10, "L'extrait doit contenir au moins 10 caractères").max(300),
  ),
  content: requiredText("Le contenu est requis").refine(
    (html) => !isHtmlContentEmpty(html),
    "Le contenu ne peut pas être vide",
  ),
  coverImageUrl: z.string().url().nullish(),
  coverImagePublicId: z.string().nullish(),
  status: articleStatusSchema.default("DRAFT"),
  projectId: z.preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.string().cuid().nullable(),
  ),
  categoryIds: z.preprocess(
    (value) => (value == null ? [] : value),
    z.array(z.string().cuid()),
  ),
};

const articleFormObjectSchema = z.object(articleFields);

export const articleFormSchema = withClassificationRefine(articleFormObjectSchema);

export const publishArticleSchema = withClassificationRefine(
  z.object({
    ...articleFields,
    coverImageUrl: z.preprocess(
      (value) => value ?? "",
      z
        .string()
        .min(1, "L'image de couverture est obligatoire pour publier")
        .url("L'URL de l'image de couverture est invalide"),
    ),
    excerpt: requiredText("L'extrait est requis").pipe(
      z
        .string()
        .min(10, "L'extrait doit contenir au moins 10 caractères")
        .max(160, "Max 160 caractères pour le partage social"),
    ),
  }),
);

export const createArticleSchema = withClassificationRefine(
  z.object({
    ...articleFields,
    authorId: z.string().cuid(),
    publishedAt: z.coerce.date().optional().nullable(),
  }),
);

export const updateArticleSchema = articleFormObjectSchema.partial().extend({
  publishedAt: z.coerce.date().optional().nullable(),
});

export type ArticleFormInput = z.infer<typeof articleFormObjectSchema>;
export type CreateArticleInput = z.infer<typeof articleFormObjectSchema> & {
  authorId: string;
  publishedAt?: Date | null;
};
export type UpdateArticleInput = Partial<ArticleFormInput> & {
  publishedAt?: Date | null;
};

export function normalizeArticleFormInput(
  input: Partial<ArticleFormInput> & Record<string, unknown>,
): ArticleFormInput {
  return {
    title: typeof input.title === "string" ? input.title : "",
    slug: typeof input.slug === "string" ? input.slug : "",
    excerpt: typeof input.excerpt === "string" ? input.excerpt : "",
    content: typeof input.content === "string" ? input.content : "<p></p>",
    coverImageUrl: typeof input.coverImageUrl === "string" ? input.coverImageUrl : null,
    coverImagePublicId:
      typeof input.coverImagePublicId === "string" ? input.coverImagePublicId : null,
    status: input.status === "DRAFT" || input.status === "PUBLISHED" || input.status === "ARCHIVED"
      ? input.status
      : "DRAFT",
    projectId: typeof input.projectId === "string" && input.projectId ? input.projectId : null,
    categoryIds: Array.isArray(input.categoryIds)
      ? input.categoryIds.filter((id): id is string => typeof id === "string")
      : [],
  };
}
