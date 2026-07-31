import type { ForumTopicSort } from "@/lib/validations/forum";
import { forumTopicSortSchema } from "@/lib/validations/forum";

export const FORUM_PAGE_SIZE = 20;

export const FORUM_SORT_LABELS: Record<ForumTopicSort, string> = {
  recent: "Activité récente",
  created: "Date de création",
  replies: "Nombre de réponses",
};

export function parseForumPage(raw?: string): number {
  return Math.max(1, Number(raw ?? "1") || 1);
}

export function parseForumSort(raw?: string): ForumTopicSort {
  const parsed = forumTopicSortSchema.safeParse(raw ?? "recent");
  return parsed.success ? parsed.data : "recent";
}
