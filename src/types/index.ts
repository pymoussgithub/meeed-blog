export type UserRole = "ADMIN" | "CONTRIBUTEUR";

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type { ArticleWithRelations } from "@/lib/services/article.service";

export type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};
