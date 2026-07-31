"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createTopicAction } from "@/actions/forum.actions";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { ComposerPanel } from "@/components/editor/ComposerPanel";
import {
  AssociateArticlePicker,
  type AssociableArticle,
} from "@/components/forum/AssociateArticlePicker";
import { Button } from "@/components/ui/Button";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { countEditorWords, isHtmlContentEmpty } from "@/lib/editor-utils";
import { emitTourSuccess } from "@/lib/tour/validation";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type NewTopicFormProps = {
  categories: CategoryOption[];
  articles: AssociableArticle[];
  defaultCategoryId?: string;
  defaultArticleIds?: string[];
};

export function NewTopicForm(props: NewTopicFormProps) {
  return (
    <DialogProvider>
      <NewTopicFormInner {...props} />
    </DialogProvider>
  );
}

function NewTopicFormInner({
  categories,
  articles,
  defaultCategoryId,
  defaultArticleIds = [],
}: NewTopicFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(
    defaultCategoryId ?? categories[0]?.id ?? "",
  );
  const [body, setBody] = useState("<p></p>");
  const [articleIds, setArticleIds] = useState<string[]>(() =>
    defaultArticleIds.filter((id) => articles.some((article) => article.id === id)),
  );
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const titleLength = title.trim().length;
  const wordCount = countEditorWords(body);
  const hasBody = !isHtmlContentEmpty(body);
  const currentCategory = useMemo(
    () => categories.find((category) => category.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);

    const result = await createTopicAction({
      title,
      categoryId,
      body,
      articleIds,
    });
    setPending(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setToast({ message: "Sujet publié.", variant: "success" });
    emitTourSuccess({ target: "forum.topic.publish" });
    router.push(`/forum/s/${result.data.slug}`);
    router.refresh();
  };

  if (categories.length === 0) {
    return (
      <p className="text-primary/60">
        Aucune rubrique active — un administrateur doit en créer une avant de publier.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <ComposerPanel
        eyebrow="Forum"
        title="Nouveau sujet"
        description="Un bon sujet commence par un titre precis, une rubrique adaptee et un premier message qui pose clairement le contexte."
        stats={[
          {
            label: "Titre",
            value: `${titleLength}/200`,
            tone: titleLength >= 12 ? "accent" : "default",
          },
          {
            label: "Message",
            value: `${wordCount} mot${wordCount > 1 ? "s" : ""}`,
            tone: hasBody ? "accent" : "muted",
          },
          {
            label: "Rubrique",
            value: currentCategory?.name ?? "Aucune",
            tone: currentCategory ? "default" : "muted",
          },
          {
            label: "Articles lies",
            value: String(articleIds.length),
            tone: articleIds.length > 0 ? "accent" : "muted",
          },
        ]}
        checklistDescription="Le panneau vous aide a verifier que le sujet est suffisamment clair avant publication."
        checklistItems={[
          {
            label: "Titre explicite",
            done: titleLength >= 12,
            helper: "Idealement un probleme, une question ou un retour d'experience identifiable.",
          },
          {
            label: "Rubrique choisie",
            done: Boolean(categoryId),
            helper: "Placez le sujet dans la rubrique la plus naturelle pour faciliter les reponses.",
          },
          {
            label: "Premier message redige",
            done: hasBody,
            helper: "Ajoutez le contexte, les details utiles et, si besoin, les etapes deja tentees.",
          },
          {
            label: "References associees",
            done: articleIds.length > 0,
            helper: "Optionnel, mais utile si un article du blog complete ou documente le sujet.",
          },
        ]}
        sidebar={
          <AssociateArticlePicker
            articles={articles}
            selectedIds={articleIds}
            onChange={setArticleIds}
          />
        }
        footer={
          <Button type="submit" variant="accent" disabled={pending} data-tour-id="forum.topic.publish">
            {pending ? "Publication..." : "Publier le sujet"}
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
            <div className="rounded-xl border border-primary/10 bg-bg-soft/35 p-4">
              <label
                htmlFor="forum-category"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-accent-dark"
              >
                Rubrique
              </label>
              <select
                id="forum-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                data-tour-id="forum.topic.rubrique"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-relaxed text-primary/55">
                Choisissez d&apos;abord la bonne rubrique: cela ameliore le tri, la recherche et la qualite des reponses.
              </p>
            </div>

            <div className="rounded-xl border-2 border-accent/15 bg-accent/5 p-4">
              <Input
                label="Titre du sujet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={200}
                placeholder="Ex. Retours d'experience sur l'arrosage ETp"
                data-tour-id="forum.topic.title"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-primary/50">
                  Formulez une intention claire: question, besoin d&apos;aide ou partage d&apos;experience.
                </span>
                <span className={titleLength > 200 ? "text-red-600" : "text-primary/55"}>
                  {titleLength} / 200
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-4 py-3">
              <p className="text-sm font-semibold text-primary-dark">Message initial</p>
              <p className="mt-1 text-xs text-primary/55">
                Presentez le contexte, les contraintes, les observations et le resultat attendu pour obtenir des reponses plus utiles.
              </p>
            </div>
            <div className="overflow-hidden rounded-b-xl" data-tour-id="forum.topic.body">
              <TipTapEditor
                content={body}
                onChange={setBody}
                placeholder="Decrivez votre sujet, ce que vous avez deja essaye, et les points sur lesquels vous attendez de l'aide..."
              />
            </div>
          </div>
        </div>
      </ComposerPanel>

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </form>
  );
}
