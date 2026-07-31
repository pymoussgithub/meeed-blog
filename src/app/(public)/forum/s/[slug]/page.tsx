import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForumPostList } from "@/components/forum/ForumPostList";
import { ForumSubscriptionToggle } from "@/components/forum/ForumSubscriptionToggle";
import { ForumToolbar } from "@/components/forum/ForumToolbar";
import { ForumWriteGate } from "@/components/forum/ForumWriteGate";
import { LinkedArticlesCarousel } from "@/components/forum/LinkedArticlesCarousel";
import { ReplyForm } from "@/components/forum/ReplyForm";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  canModerateForum,
  canReplyToTopicStatus,
} from "@/lib/forum-permissions";
import { FORUM_PAGE_SIZE, parseForumPage } from "@/lib/forum-listing";
import {
  countForumPostsByTopicId,
  getForumPostsByTopicId,
} from "@/lib/services/forum-post.service";
import { getForumTopicSubscriptionState } from "@/lib/services/forum-subscription.service";
import { getForumTopicBySlug } from "@/lib/services/forum-topic.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const topic = await getForumTopicBySlug(slug);
    if (!topic) return { title: "Sujet introuvable" };

    return buildPageMetadata({
      title: `${topic.title} — Forum`,
      description: `Discussion « ${topic.title} » dans la rubrique ${topic.category.name}.`,
      path: `/forum/s/${topic.slug}`,
    });
  } catch {
    return { title: "Sujet forum" };
  }
}

export default async function ForumTopicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = parseForumPage(page);
  const offset = (currentPage - 1) * FORUM_PAGE_SIZE;
  const user = await getCurrentUser();
  const asAdmin = canModerateForum(user);

  const topic = await getForumTopicBySlug(slug, { asAdmin });
  if (!topic) {
    notFound();
  }

  const [posts, total] = await Promise.all([
    getForumPostsByTopicId(topic.id, { limit: FORUM_PAGE_SIZE, offset, asAdmin }),
    countForumPostsByTopicId(topic.id, { asAdmin }),
  ]);
  const isSubscribed = user
    ? await getForumTopicSubscriptionState(user.id, topic.id)
    : false;

  const totalPages = Math.max(1, Math.ceil(total / FORUM_PAGE_SIZE));
  const canReply = canReplyToTopicStatus(topic.status);
  const replyCount = Math.max(0, topic.postsCount - 1);
  const publishedArticles = topic.articles
    .map((link) => link.article)
    .filter((article) => article.status === "PUBLISHED");
  const hasArticles = publishedArticles.length > 0;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Forum", path: "/forum" },
    { name: topic.category.name, path: `/forum/r/${topic.category.slug}` },
    { name: topic.title, path: `/forum/s/${topic.slug}` },
  ]);

  return (
    <div className="container-meeed py-4 sm:py-5">
      <JsonLd data={breadcrumb} />

      <ForumToolbar
        backHref={`/forum/r/${topic.category.slug}`}
        backLabel="Retour"
        newTopicHref={`/forum/nouveau?rubrique=${topic.category.slug}`}
      />

      <header className="mb-5 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
        <div
          className={
            hasArticles
              ? "grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,1fr)]"
              : undefined
          }
        >
          <div className="flex flex-col justify-center px-4 py-5 sm:px-6 sm:py-6">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Link
                  href={`/forum/r/${topic.category.slug}`}
                  className="text-xs font-semibold uppercase tracking-wide text-accent-dark transition-colors hover:text-accent"
                >
                  {topic.category.name}
                </Link>
                {topic.isPinned ? <Badge color="#3b9a93">Épinglé</Badge> : null}
                {topic.status === "LOCKED" ? <Badge color="#292f36">Verrouillé</Badge> : null}
                {topic.status === "ARCHIVED" ? <Badge color="#6b7280">Archivé</Badge> : null}
              </div>
              {user ? (
                <ForumSubscriptionToggle topicId={topic.id} initialSubscribed={isSubscribed} />
              ) : null}
            </div>

            <h1 className="font-heading text-2xl font-bold text-primary-dark sm:text-3xl">
              {topic.title}
            </h1>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-bg-soft/40 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-primary/45">
                  Auteur
                </dt>
                <dd className="mt-0.5 truncate text-sm font-medium text-primary-dark">
                  {topic.author.name}
                </dd>
              </div>
              <div className="rounded-lg bg-bg-soft/40 px-3 py-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-primary/45">
                  Publié
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-primary-dark">
                  <time dateTime={topic.createdAt.toISOString()}>
                    {formatDate(topic.createdAt)}
                  </time>
                </dd>
              </div>
              <div className="col-span-2 rounded-lg bg-bg-soft/40 px-3 py-2 sm:col-span-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-primary/45">
                  Activité
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-primary-dark">
                  {topic.postsCount} message{topic.postsCount > 1 ? "s" : ""}
                  {replyCount > 0
                    ? ` · ${replyCount} réponse${replyCount > 1 ? "s" : ""}`
                    : ""}
                </dd>
              </div>
            </dl>
          </div>

          {hasArticles ? (
            <aside
              aria-labelledby="forum-linked-articles"
              className="border-t border-primary/10 bg-bg-soft/35 px-4 py-5 sm:px-5 sm:py-6 lg:border-l lg:border-t-0"
            >
              <LinkedArticlesCarousel articles={publishedArticles} />
            </aside>
          ) : null}
        </div>
      </header>

      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-sm font-semibold text-primary/70 sm:text-base">
          Discussion
        </h2>
        <p className="text-xs text-primary/45">
          {total} message{total > 1 ? "s" : ""}
        </p>
      </div>

      <ForumPostList posts={posts} startIndex={offset} canModerate={asAdmin} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/forum/s/${topic.slug}`}
      />

      <section
        aria-labelledby="forum-reply-heading"
        className="mt-6 overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm"
      >
        <div className="border-b border-primary/8 bg-bg-soft/40 px-4 py-3 sm:px-5">
          <h2 id="forum-reply-heading" className="font-heading text-base font-bold text-primary-dark">
            Répondre
          </h2>
          <p className="mt-0.5 text-xs text-primary/50">
            Votre message sera publié dans cette discussion.
          </p>
        </div>
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          <ForumWriteGate callbackPath={`/forum/s/${topic.slug}`}>
            <ReplyForm
              topicId={topic.id}
              disabled={!canReply}
              disabledReason={
                topic.status === "LOCKED"
                  ? "Ce sujet est verrouillé — aucune nouvelle réponse."
                  : topic.status === "ARCHIVED"
                    ? "Ce sujet est archivé — lecture seule."
                    : undefined
              }
            />
          </ForumWriteGate>
        </div>
      </section>
    </div>
  );
}
