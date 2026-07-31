export type ForumSearchFilters = {
  /** Full-text sur titres des sujets et corps des messages / réponses */
  q?: string;
  /** Filtre ILIKE sur le titre du sujet uniquement */
  title?: string;
  /** Auteur du sujet ou d’un message */
  authorId?: string;
  /** Slug de rubrique forum */
  rubrique?: string;
  /** Slug de projet (via articles liés) */
  project?: string;
  /** Date de création du sujet (inclusive), format YYYY-MM-DD */
  from?: string;
  /** Date de création du sujet (inclusive), format YYYY-MM-DD */
  to?: string;
};

export function normalizeForumSearchFilters(raw: {
  q?: string;
  title?: string;
  author?: string;
  authorId?: string;
  rubrique?: string;
  project?: string;
  from?: string;
  to?: string;
}): ForumSearchFilters {
  const q = raw.q?.trim() ?? "";
  const title = raw.title?.trim() ?? "";
  const authorId = raw.authorId?.trim() || raw.author?.trim() || undefined;

  return {
    q: q || undefined,
    title: title || undefined,
    authorId,
    rubrique: raw.rubrique?.trim() || undefined,
    project: raw.project?.trim() || undefined,
    from: raw.from?.trim() || undefined,
    to: raw.to?.trim() || undefined,
  };
}

export function hasForumSearchCriteria(filters: ForumSearchFilters): boolean {
  return Boolean(
    filters.q ||
      filters.title ||
      filters.authorId ||
      filters.rubrique ||
      filters.project ||
      filters.from ||
      filters.to,
  );
}

export function countForumSearchCriteria(filters: ForumSearchFilters): number {
  let count = 0;
  if (filters.q) count += 1;
  if (filters.title) count += 1;
  if (filters.authorId) count += 1;
  if (filters.rubrique) count += 1;
  if (filters.project) count += 1;
  if (filters.from) count += 1;
  if (filters.to) count += 1;
  return count;
}

export function forumSearchFiltersToQuery(
  filters: ForumSearchFilters,
): Record<string, string | undefined> {
  return {
    title: filters.title,
    q: filters.q,
    author: filters.authorId,
    rubrique: filters.rubrique,
    project: filters.project,
    from: filters.from,
    to: filters.to,
  };
}
