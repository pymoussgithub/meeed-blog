"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createLinkedForumTopicAction,
  linkArticleForumTopicAction,
  unlinkArticleForumTopicAction,
} from "@/actions/article-forum.actions";
import {
  AssociateForumTopicPicker,
  type AssociableForumTopic,
} from "@/components/admin/AssociateForumTopicPicker";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

type LinkedTopic = {
  topicId: string;
  topic: {
    id: string;
    title: string;
    slug: string;
    status: string;
    deletedAt: Date | null;
    isHidden: boolean;
    category: { name: string; slug: string };
    author: { name: string };
  };
};

type CategoryOption = { id: string; name: string };

type ArticleForumLinksPanelProps = {
  articleId: string;
  links: LinkedTopic[];
  categories: CategoryOption[];
  browsableTopics: AssociableForumTopic[];
};

export function ArticleForumLinksPanel({
  articleId,
  links,
  categories,
  browsableTopics,
}: ArticleForumLinksPanelProps) {
  const router = useRouter();
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [body, setBody] = useState("<p></p>");
  const [creating, setCreating] = useState(false);

  const linkedIds = useMemo(
    () => links.map((link) => link.topicId),
    [links],
  );
  const linkedIdSet = useMemo(() => new Set(linkedIds), [linkedIds]);

  const topicsForPicker = useMemo(() => {
    const byId = new Map(browsableTopics.map((topic) => [topic.id, topic]));
    for (const link of links) {
      if (byId.has(link.topicId)) continue;
      byId.set(link.topicId, {
        id: link.topic.id,
        title: link.topic.title,
        slug: link.topic.slug,
        status: link.topic.status,
        lastPostAt: null,
        categoryName: link.topic.category.name,
        authorName: link.topic.author.name,
      });
    }
    return Array.from(byId.values());
  }, [browsableTopics, links]);

  const handleUnlink = async (topicId: string) => {
    const result = await unlinkArticleForumTopicAction({ articleId, topicId });
    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }
    setToast({ message: "Association retirée.", variant: "success" });
    router.refresh();
  };

  const handleBrowseConfirm = async (nextIds: string[]) => {
    const nextSet = new Set(nextIds);
    const toLink = nextIds.filter((id) => !linkedIdSet.has(id));
    const toUnlink = linkedIds.filter((id) => !nextSet.has(id));

    for (const topicId of toLink) {
      const result = await linkArticleForumTopicAction({ articleId, topicId });
      if (!result.success) {
        setToast({ message: result.error, variant: "error" });
        router.refresh();
        return;
      }
    }

    for (const topicId of toUnlink) {
      const result = await unlinkArticleForumTopicAction({ articleId, topicId });
      if (!result.success) {
        setToast({ message: result.error, variant: "error" });
        router.refresh();
        return;
      }
    }

    if (toLink.length === 0 && toUnlink.length === 0) {
      setToast({ message: "Aucune modification.", variant: "success" });
      return;
    }

    setToast({
      message:
        toLink.length + toUnlink.length === 1
          ? "Association mise à jour."
          : "Associations mises à jour.",
      variant: "success",
    });
    router.refresh();
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    const result = await createLinkedForumTopicAction(articleId, {
      title,
      categoryId,
      body,
    });
    setCreating(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setTitle("");
    setBody("<p></p>");
    setToast({ message: "Discussion créée et liée.", variant: "success" });
    router.refresh();
  };

  return (
    <section
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-4"
      data-tour-id="article.form.forum-links"
    >
      <div>
        <h2 className="text-sm font-semibold text-primary-dark">Discussions forum liées</h2>
        <p className="mt-0.5 text-xs text-primary/60">
          Associez une ou plusieurs discussions à cet article.
        </p>
      </div>

      {links.length === 0 ? (
        <p className="text-sm text-primary/55">Aucune discussion associée.</p>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.topicId}
              className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50/40 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/forum/s/${link.topic.slug}`}
                  className="font-medium text-accent-dark hover:underline"
                  target="_blank"
                >
                  {link.topic.title}
                </Link>
                <p className="text-xs text-primary/50">
                  {link.topic.category.name} · {link.topic.author.name}
                  {link.topic.isHidden || link.topic.deletedAt
                    ? " · (modéré)"
                    : ""}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 !rounded-lg !border-red-200 !px-3.5 !py-1.5 text-xs !text-red-600 hover:!bg-red-50 hover:!border-red-300"
                onClick={() => handleUnlink(link.topicId)}
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Associer une discussion existante</h3>
        <AssociateForumTopicPicker
          topics={topicsForPicker}
          selectedIds={linkedIds}
          onConfirm={handleBrowseConfirm}
          triggerClassName="h-10 whitespace-nowrap rounded-lg border border-accent/50 px-3.5 py-0 text-sm font-medium"
        />
        {topicsForPicker.length === 0 ? (
          <p className="text-xs text-primary/45">Aucun sujet forum disponible.</p>
        ) : null}
      </div>

      <form onSubmit={handleCreate} className="space-y-3 border-t border-gray-100 pt-5">
        <h3 className="text-sm font-medium">Créer une discussion pré-liée</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-primary/55">Créez d&apos;abord une rubrique forum.</p>
        ) : (
          <>
            <Input
              label="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="linked-cat">
                Rubrique
              </label>
              <select
                id="linked-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <TipTapEditor content={body} onChange={setBody} placeholder="Message initial…" />
            </div>
            <Button type="submit" variant="accent" disabled={creating}>
              {creating ? "Création…" : "Créer et lier"}
            </Button>
          </>
        )}
      </form>

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </section>
  );
}
