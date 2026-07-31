import { publicPostWhere, publicTopicListWhere } from "@/lib/forum-permissions";
import { prisma } from "@/lib/prisma";
import type {
  CreateForumCategoryInput,
  UpdateForumCategoryInput,
} from "@/lib/validations/forum";

const publicTopicFilter = {
  deletedAt: null,
  isHidden: false,
  status: { not: "ARCHIVED" as const },
};

const lastTopicSelect = {
  id: true,
  title: true,
  slug: true,
  lastPostAt: true,
  createdAt: true,
  postsCount: true,
  author: { select: { id: true, name: true } },
  posts: {
    where: publicPostWhere(),
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: {
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  },
} as const;

export type ForumIndexLastTopic = {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  lastPostAt: Date;
  authorName: string;
  lastAuthorName: string;
};

export type ForumIndexRow = {
  id: string;
  name: string;
  href: string;
  description: string | null;
  topicsCount: number;
  messagesCount: number;
  lastTopic: ForumIndexLastTopic | null;
};

function mapLastTopic(
  topic: {
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    lastPostAt: Date | null;
    author: { name: string };
    posts: { author: { name: string } }[];
  } | null,
): ForumIndexLastTopic | null {
  if (!topic) return null;
  const lastPost = topic.posts[0] ?? null;
  return {
    id: topic.id,
    title: topic.title,
    slug: topic.slug,
    createdAt: topic.createdAt,
    lastPostAt: topic.lastPostAt ?? topic.createdAt,
    authorName: topic.author.name,
    lastAuthorName: lastPost?.author.name ?? topic.author.name,
  };
}

async function getViewStats(whereExtra: Parameters<typeof publicTopicListWhere>[0] = {}) {
  const where = publicTopicListWhere(whereExtra);

  const [topicsCount, messagesAgg, lastTopic] = await Promise.all([
    prisma.forumTopic.count({ where }),
    prisma.forumTopic.aggregate({
      where,
      _sum: { postsCount: true },
    }),
    prisma.forumTopic.findFirst({
      where,
      orderBy: [{ lastPostAt: "desc" }, { createdAt: "desc" }],
      select: lastTopicSelect,
    }),
  ]);

  return {
    topicsCount,
    messagesCount: messagesAgg._sum.postsCount ?? 0,
    lastTopic: mapLastTopic(lastTopic),
  };
}

export async function getActiveForumCategories() {
  return prisma.forumCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          topics: {
            where: publicTopicFilter,
          },
        },
      },
    },
  });
}

/** Accueil forum : vue Importants + rubriques avec stats. */
export async function getForumHomeIndex(): Promise<ForumIndexRow[]> {
  const [importantStats, categories] = await Promise.all([
    getViewStats({ isPinned: true }),
    prisma.forumCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            topics: { where: publicTopicFilter },
          },
        },
        topics: {
          where: publicTopicListWhere(),
          orderBy: [{ lastPostAt: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: lastTopicSelect,
        },
      },
    }),
  ]);

  const messageTotals = await prisma.forumTopic.groupBy({
    by: ["categoryId"],
    where: publicTopicListWhere({
      categoryId: { in: categories.map((category) => category.id) },
    }),
    _sum: { postsCount: true },
  });

  const messagesByCategory = new Map(
    messageTotals.map((row) => [row.categoryId, row._sum.postsCount ?? 0]),
  );

  const viewRows: ForumIndexRow[] = [
    {
      id: "view-importants",
      name: "Importants",
      href: "/forum/importants",
      description: "Sujets épinglés et mis en avant",
      topicsCount: importantStats.topicsCount,
      messagesCount: importantStats.messagesCount,
      lastTopic: importantStats.lastTopic,
    },
  ];

  const categoryRows: ForumIndexRow[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    href: `/forum/r/${category.slug}`,
    description: category.description,
    topicsCount: category._count.topics,
    messagesCount: messagesByCategory.get(category.id) ?? 0,
    lastTopic: mapLastTopic(category.topics[0] ?? null),
  }));

  return [...viewRows, ...categoryRows];
}

/** @deprecated Prefer getForumHomeIndex for the public forum home. */
export async function getForumCategoryIndex() {
  const rows = await getForumHomeIndex();
  return rows.filter((row) => !row.id.startsWith("view-"));
}

export type ForumCategoryIndexItem = ForumIndexRow;

export async function getForumCategoriesForAdmin() {
  return prisma.forumCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { topics: true } },
    },
  });
}

export async function getForumCategoryBySlug(slug: string) {
  return prisma.forumCategory.findUnique({
    where: { slug },
  });
}

export async function getForumCategoryById(id: string) {
  return prisma.forumCategory.findUnique({
    where: { id },
  });
}

export async function createForumCategory(data: CreateForumCategoryInput) {
  const existing = await prisma.forumCategory.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Ce slug de rubrique est déjà utilisé");
  }

  return prisma.forumCategory.create({ data });
}

export async function updateForumCategory(id: string, data: UpdateForumCategoryInput) {
  if (data.slug) {
    const existing = await prisma.forumCategory.findFirst({
      where: { slug: data.slug, NOT: { id } },
      select: { id: true },
    });

    if (existing) {
      throw new Error("Ce slug de rubrique est déjà utilisé");
    }
  }

  return prisma.forumCategory.update({
    where: { id },
    data,
  });
}

export async function reorderForumCategories(orderedIds: string[]) {
  const existing = await prisma.forumCategory.findMany({
    select: { id: true },
    orderBy: { sortOrder: "asc" },
  });
  const existingIds = new Set(existing.map((category) => category.id));

  if (
    orderedIds.length !== existing.length ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new Error("Liste de rubriques invalide pour le réordonnancement");
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.forumCategory.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );
}

export async function deleteForumCategory(id: string) {
  const category = await prisma.forumCategory.findUnique({
    where: { id },
    include: {
      _count: { select: { topics: true } },
    },
  });

  if (!category) {
    throw new Error("Rubrique introuvable");
  }

  if (category._count.topics > 0) {
    throw new Error("Impossible de supprimer une rubrique contenant des sujets");
  }

  return prisma.forumCategory.delete({ where: { id } });
}
