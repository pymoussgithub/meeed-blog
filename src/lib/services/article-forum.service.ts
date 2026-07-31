import { ArticleStatus } from "@prisma/client";
import { publicTopicListWhere, publicTopicWhere } from "@/lib/forum-permissions";
import { prisma } from "@/lib/prisma";
import { sanitizeHtml } from "@/lib/sanitize";
import { createForumTopic } from "@/lib/services/forum-topic.service";

function publishedArticleWhere() {
  return {
    status: ArticleStatus.PUBLISHED,
    publishedAt: { lte: new Date() },
  };
}

export async function getForumTopicsLinkedToArticle(articleId: string) {
  return prisma.forumTopic.findMany({
    where: publicTopicWhere({
      articles: { some: { articleId } },
    }),
    orderBy: [{ isPinned: "desc" }, { lastPostAt: "desc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
  });
}

export async function getPublishedForumTopicsForArticleSlug(articleSlug: string) {
  return prisma.forumTopic.findMany({
    where: publicTopicListWhere({
      articles: {
        some: {
          article: {
            slug: articleSlug,
            ...publishedArticleWhere(),
          },
        },
      },
    }),
    orderBy: [{ isPinned: "desc" }, { lastPostAt: "desc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
  });
}

export async function getArticleForumLinksForAdmin(articleId: string) {
  return prisma.articleForumTopic.findMany({
    where: { articleId },
    orderBy: { createdAt: "desc" },
    include: {
      topic: {
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
      },
    },
  });
}

export async function listForumTopicsForLinking(limit = 100) {
  return prisma.forumTopic.findMany({
    where: { deletedAt: null },
    take: limit,
    orderBy: [{ isPinned: "desc" }, { lastPostAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      lastPostAt: true,
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
  });
}

export async function linkArticleToForumTopic(articleId: string, topicId: string) {
  const [article, topic] = await Promise.all([
    prisma.article.findUnique({ where: { id: articleId }, select: { id: true } }),
    prisma.forumTopic.findUnique({
      where: { id: topicId },
      select: { id: true, deletedAt: true },
    }),
  ]);

  if (!article) throw new Error("Article introuvable");
  if (!topic || topic.deletedAt) throw new Error("Sujet introuvable");

  return prisma.articleForumTopic.upsert({
    where: {
      articleId_topicId: { articleId, topicId },
    },
    update: {},
    create: { articleId, topicId },
  });
}

export async function unlinkArticleFromForumTopic(articleId: string, topicId: string) {
  return prisma.articleForumTopic.deleteMany({
    where: { articleId, topicId },
  });
}

export async function createForumTopicLinkedToArticle(
  authorId: string,
  articleId: string,
  data: { title: string; categoryId: string; body: string },
) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true },
  });

  if (!article) {
    throw new Error("Article introuvable");
  }

  // createForumTopic exige des articles publiés (formulaire forum public) ;
  // depuis l'éditorial, brouillons inclus via linkArticleToForumTopic.
  const topic = await createForumTopic(authorId, {
    title: data.title,
    categoryId: data.categoryId,
    body: sanitizeHtml(data.body),
  });

  await linkArticleToForumTopic(articleId, topic.id);

  return topic;
}
