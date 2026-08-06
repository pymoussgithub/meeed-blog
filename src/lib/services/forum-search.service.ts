import { Prisma } from "@prisma/client";
import {
  hasForumSearchCriteria,
  type ForumSearchFilters,
} from "@/lib/forum-search";
import { prisma } from "@/lib/prisma";

export type { ForumSearchFilters } from "@/lib/forum-search";
export {
  countForumSearchCriteria,
  hasForumSearchCriteria,
  normalizeForumSearchFilters,
} from "@/lib/forum-search";

/** Markers inserted by PostgreSQL ts_headline — parsed client-side into <mark>. */
export const FORUM_SEARCH_MARK_START = "<<mark>>";
export const FORUM_SEARCH_MARK_END = "<</mark>>";

const HEADLINE_OPTIONS = `StartSel=${FORUM_SEARCH_MARK_START}, StopSel=${FORUM_SEARCH_MARK_END}, MaxWords=40, MinWords=12, ShortWord=1, MaxFragments=1, FragmentDelimiter= … `;

const SHORT_SNIPPET_LIMIT = 220;

/** Wrap query tokens in markers for short texts where ts_headline drops neighbors. */
export function markSearchTerms(text: string, query: string): string {
  const tokens = query
    .trim()
    .split(/\s+/)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter((t) => t.length >= 2);
  if (!text || tokens.length === 0) return text;

  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  return text.replace(
    pattern,
    `${FORUM_SEARCH_MARK_START}$1${FORUM_SEARCH_MARK_END}`,
  );
}

function preferSnippet(headline: string, plain: string, query: string): string {
  const cleanHeadline = headline?.trim() ?? "";
  const cleanPlain = plain?.trim() ?? "";
  if (!cleanPlain) return cleanHeadline;

  if (cleanPlain.length <= SHORT_SNIPPET_LIMIT) {
    return markSearchTerms(cleanPlain, query);
  }

  return cleanHeadline || markSearchTerms(cleanPlain.slice(0, SHORT_SNIPPET_LIMIT), query);
}

export type ForumSearchHit = {
  kind: "topic" | "post";
  rank: number;
  topicId: string;
  topicSlug: string;
  topicTitle: string;
  categoryName: string;
  categorySlug: string;
  postId: string | null;
  /** Snippet with <<mark>>…<</mark>> around matched terms when full-text. */
  excerpt: string;
  topicCreatedAt: Date;
  topicAuthorName: string;
  matchedAuthorName: string;
  matchedAt: Date;
  postsCount: number;
  lastPostAt: Date | null;
  lastPostAuthorName: string | null;
  isPinned: boolean;
  status: string;
};

type RawHit = {
  kind: string;
  rank: number;
  topic_id: string;
  topic_slug: string;
  topic_title: string;
  category_name: string;
  category_slug: string;
  post_id: string | null;
  excerpt: string;
  plain_excerpt: string | null;
  topic_created_at: Date;
  topic_author_name: string;
  matched_author_name: string;
  matched_at: Date;
  posts_count: number;
  last_post_at: Date | null;
  last_post_author_name: string | null;
  is_pinned: boolean;
  status: string;
};

function parseDayStart(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDayEndExclusive(value: string): Date | null {
  const start = parseDayStart(value);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return end;
}

function buildTopicWhereSql(filters: ForumSearchFilters): Prisma.Sql {
  const parts: Prisma.Sql[] = [
    Prisma.sql`t."deletedAt" IS NULL`,
    Prisma.sql`t."isHidden" = false`,
    Prisma.sql`t.status <> 'ARCHIVED'`,
  ];

  if (filters.title) {
    parts.push(Prisma.sql`t.title ILIKE ${`%${filters.title}%`}`);
  }

  if (filters.authorId) {
    parts.push(Prisma.sql`(
      t."authorId" = ${filters.authorId}
      OR EXISTS (
        SELECT 1 FROM "ForumPost" p_auth
        WHERE p_auth."topicId" = t.id
          AND p_auth."authorId" = ${filters.authorId}
          AND p_auth."deletedAt" IS NULL
          AND p_auth."isHidden" = false
      )
    )`);
  }

  if (filters.rubrique) {
    parts.push(Prisma.sql`c.slug = ${filters.rubrique}`);
  }

  const fromDate = filters.from ? parseDayStart(filters.from) : null;
  if (fromDate) {
    parts.push(Prisma.sql`t."createdAt" >= ${fromDate}`);
  }

  const toDate = filters.to ? parseDayEndExclusive(filters.to) : null;
  if (toDate) {
    parts.push(Prisma.sql`t."createdAt" < ${toDate}`);
  }

  return Prisma.join(parts, " AND ");
}

const lastPostAuthorSql = Prisma.sql`(
  SELECT u_lp.name
  FROM "ForumPost" lp
  JOIN "User" u_lp ON u_lp.id = lp."authorId"
  WHERE lp."topicId" = t.id
    AND lp."deletedAt" IS NULL
    AND lp."isHidden" = false
  ORDER BY lp."createdAt" DESC
  LIMIT 1
)`;

function mapHit(hit: RawHit, query = ""): ForumSearchHit {
  const excerpt = query
    ? preferSnippet(hit.excerpt ?? "", hit.plain_excerpt ?? hit.excerpt ?? "", query)
    : (hit.excerpt?.trim() ?? "");

  return {
    kind: hit.kind === "post" ? "post" : "topic",
    rank: Number(hit.rank),
    topicId: hit.topic_id,
    topicSlug: hit.topic_slug,
    topicTitle: hit.topic_title,
    categoryName: hit.category_name,
    categorySlug: hit.category_slug,
    postId: hit.post_id,
    excerpt,
    topicCreatedAt: hit.topic_created_at,
    topicAuthorName: hit.topic_author_name,
    matchedAuthorName: hit.matched_author_name,
    matchedAt: hit.matched_at,
    postsCount: Number(hit.posts_count),
    lastPostAt: hit.last_post_at,
    lastPostAuthorName: hit.last_post_author_name,
    isPinned: Boolean(hit.is_pinned),
    status: hit.status,
  };
}

/**
 * Recherche forum : full-text (optionnel) + filtres titre / contributeur / date / rubrique.
 * Exclut contenus masqués / soft-deleted / sujets archivés pour le public.
 */
export async function searchForum(
  filtersInput: ForumSearchFilters | string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ hits: ForumSearchHit[]; total: number }> {
  const filters: ForumSearchFilters =
    typeof filtersInput === "string"
      ? { q: filtersInput.trim() || undefined }
      : filtersInput;

  if (!hasForumSearchCriteria(filters)) {
    return { hits: [], total: 0 };
  }

  if (filters.q && filters.q.length < 2) {
    return { hits: [], total: 0 };
  }

  const topicWhere = buildTopicWhereSql(filters);
  const q = filters.q?.trim() ?? "";
  const useFullText = q.length >= 2;

  const hits = useFullText
    ? await prisma.$queryRaw<RawHit[]>`
        WITH q AS (SELECT plainto_tsquery('french', ${q}) AS query),
        topic_hits AS (
          SELECT
            'topic'::text AS kind,
            ts_rank(to_tsvector('french', t.title), q.query) AS rank,
            t.id AS topic_id,
            t.slug AS topic_slug,
            t.title AS topic_title,
            c.name AS category_name,
            c.slug AS category_slug,
            NULL::text AS post_id,
            ts_headline(
              'french',
              t.title,
              q.query,
              ${HEADLINE_OPTIONS}
            ) AS excerpt,
            t.title AS plain_excerpt,
            t."createdAt" AS topic_created_at,
            u_topic.name AS topic_author_name,
            u_topic.name AS matched_author_name,
            t."createdAt" AS matched_at,
            t."postsCount" AS posts_count,
            t."lastPostAt" AS last_post_at,
            ${lastPostAuthorSql} AS last_post_author_name,
            t."isPinned" AS is_pinned,
            t.status::text AS status
          FROM "ForumTopic" t
          JOIN "ForumCategory" c ON c.id = t."categoryId"
          JOIN "User" u_topic ON u_topic.id = t."authorId"
          CROSS JOIN q
          WHERE ${topicWhere}
            AND to_tsvector('french', t.title) @@ q.query
        ),
        post_hits AS (
          SELECT
            'post'::text AS kind,
            ts_rank(to_tsvector('french', p.body), q.query) AS rank,
            t.id AS topic_id,
            t.slug AS topic_slug,
            t.title AS topic_title,
            c.name AS category_name,
            c.slug AS category_slug,
            p.id AS post_id,
            ts_headline(
              'french',
              regexp_replace(regexp_replace(p.body, '<[^>]+>', ' ', 'g'), '\\s+', ' ', 'g'),
              q.query,
              ${HEADLINE_OPTIONS}
            ) AS excerpt,
            left(
              regexp_replace(regexp_replace(p.body, '<[^>]+>', ' ', 'g'), '\\s+', ' ', 'g'),
              400
            ) AS plain_excerpt,
            t."createdAt" AS topic_created_at,
            u_topic.name AS topic_author_name,
            u_post.name AS matched_author_name,
            p."createdAt" AS matched_at,
            t."postsCount" AS posts_count,
            t."lastPostAt" AS last_post_at,
            ${lastPostAuthorSql} AS last_post_author_name,
            t."isPinned" AS is_pinned,
            t.status::text AS status
          FROM "ForumPost" p
          JOIN "ForumTopic" t ON t.id = p."topicId"
          JOIN "ForumCategory" c ON c.id = t."categoryId"
          JOIN "User" u_topic ON u_topic.id = t."authorId"
          JOIN "User" u_post ON u_post.id = p."authorId"
          CROSS JOIN q
          WHERE ${topicWhere}
            AND p."deletedAt" IS NULL
            AND p."isHidden" = false
            AND to_tsvector('french', p.body) @@ q.query
        ),
        combined AS (
          SELECT * FROM topic_hits
          UNION ALL
          SELECT * FROM post_hits
        )
        SELECT *
        FROM combined
        ORDER BY rank DESC, topic_title ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `
    : await prisma.$queryRaw<RawHit[]>`
        SELECT
          'topic'::text AS kind,
          0::float AS rank,
          t.id AS topic_id,
          t.slug AS topic_slug,
          t.title AS topic_title,
          c.name AS category_name,
          c.slug AS category_slug,
          NULL::text AS post_id,
          ''::text AS excerpt,
          ''::text AS plain_excerpt,
          t."createdAt" AS topic_created_at,
          u_topic.name AS topic_author_name,
          u_topic.name AS matched_author_name,
          t."createdAt" AS matched_at,
          t."postsCount" AS posts_count,
          t."lastPostAt" AS last_post_at,
          ${lastPostAuthorSql} AS last_post_author_name,
          t."isPinned" AS is_pinned,
          t.status::text AS status
        FROM "ForumTopic" t
        JOIN "ForumCategory" c ON c.id = t."categoryId"
        JOIN "User" u_topic ON u_topic.id = t."authorId"
        WHERE ${topicWhere}
        ORDER BY t."lastPostAt" DESC NULLS LAST, t."createdAt" DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

  const countRows = useFullText
    ? await prisma.$queryRaw<Array<{ count: bigint }>>`
        WITH q AS (SELECT plainto_tsquery('french', ${q}) AS query)
        SELECT COUNT(*)::bigint AS count FROM (
          SELECT t.id
          FROM "ForumTopic" t
          JOIN "ForumCategory" c ON c.id = t."categoryId"
          CROSS JOIN q
          WHERE ${topicWhere}
            AND to_tsvector('french', t.title) @@ q.query
          UNION ALL
          SELECT p.id
          FROM "ForumPost" p
          JOIN "ForumTopic" t ON t.id = p."topicId"
          JOIN "ForumCategory" c ON c.id = t."categoryId"
          CROSS JOIN q
          WHERE ${topicWhere}
            AND p."deletedAt" IS NULL
            AND p."isHidden" = false
            AND to_tsvector('french', p.body) @@ q.query
        ) AS hits
      `
    : await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "ForumTopic" t
        JOIN "ForumCategory" c ON c.id = t."categoryId"
        WHERE ${topicWhere}
      `;

  return {
    hits: hits.map((hit) => mapHit(hit, q)),
    total: Number(countRows[0]?.count ?? 0),
  };
}

export async function getForumSearchFacets() {
  const [categories, authors] = await Promise.all([
    prisma.forumCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          {
            forumTopics: {
              some: {
                deletedAt: null,
                isHidden: false,
                status: { not: "ARCHIVED" },
              },
            },
          },
          {
            forumPosts: {
              some: {
                deletedAt: null,
                isHidden: false,
                topic: {
                  deletedAt: null,
                  isHidden: false,
                  status: { not: "ARCHIVED" },
                },
              },
            },
          },
        ],
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { categories, authors };
}
