"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createReplyAction } from "@/actions/forum.actions";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { ComposerPanel } from "@/components/editor/ComposerPanel";
import { Button } from "@/components/ui/Button";
import { DialogProvider } from "@/components/ui/DialogProvider";
import { Toast } from "@/components/ui/Toast";
import { countEditorWords, isHtmlContentEmpty } from "@/lib/editor-utils";
import { emitTourSuccess } from "@/lib/tour/validation";

type ReplyFormProps = {
  topicId: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function ReplyForm(props: ReplyFormProps) {
  if (props.disabled) {
    return (
      <p className="rounded-lg border border-primary/10 bg-bg-soft/40 px-4 py-3 text-sm text-primary/70">
        {props.disabledReason ?? "Ce sujet n'accepte plus de réponses."}
      </p>
    );
  }

  return (
    <DialogProvider>
      <ReplyFormInner topicId={props.topicId} />
    </DialogProvider>
  );
}

function ReplyFormInner({ topicId }: { topicId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("<p></p>");
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);
  const wordCount = countEditorWords(body);
  const hasBody = !isHtmlContentEmpty(body);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);

    const result = await createReplyAction({ topicId, body });
    setPending(false);

    if (!result.success) {
      setToast({ message: result.error, variant: "error" });
      return;
    }

    setBody("<p></p>");
    emitTourSuccess({ target: "forum.reply.submit" });
    setToast({ message: "Réponse publiée.", variant: "success" });
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-tour-id="forum.reply.form">
      <ComposerPanel
        eyebrow="Forum"
        title="Votre reponse"
        description="Prenez le temps d'apporter une reponse claire, utile et si possible actionnable pour les autres lecteurs du sujet."
        stats={[
          {
            label: "Message",
            value: `${wordCount} mot${wordCount > 1 ? "s" : ""}`,
            tone: hasBody ? "accent" : "muted",
          },
          {
            label: "Etat",
            value: hasBody ? "Pret a envoyer" : "En cours",
            tone: hasBody ? "accent" : "default",
          },
        ]}
        checklistDescription="Une bonne reponse est souvent concise, contextualisee et facile a reutiliser."
        checklistItems={[
          {
            label: "Message redige",
            done: hasBody,
            helper: "Evitez les reponses vides ou trop courtes sans contexte.",
          },
          {
            label: "Information utile",
            done: wordCount >= 20,
            helper: "Ajoutez une explication, un retour d'experience ou une piste concrete.",
          },
          {
            label: "Mise en forme lisible",
            done: hasBody,
            helper: "Utilisez paragraphes, listes ou liens pour rendre la lecture plus simple.",
          },
        ]}
        sidebar={
          <div className="rounded-2xl border border-primary/10 bg-bg-soft/35 p-4">
            <h3 className="text-sm font-semibold text-primary-dark">Conseils de reponse</h3>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-primary/60">
              <li>Expliquez ce qui a fonctionne ou non, pas seulement la conclusion.</li>
              <li>Si vous citez une ressource, ajoutez un lien ou un exemple.</li>
              <li>Gardez un ton direct et bienveillant pour encourager l'echange.</li>
            </ul>
          </div>
        }
        footer={
          <Button type="submit" variant="accent" disabled={pending} data-tour-id="forum.reply.submit">
            {pending ? "Envoi..." : "Publier la reponse"}
          </Button>
        }
      >
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-primary-dark">Contenu de la reponse</p>
            <p className="mt-1 text-xs text-primary/55">
              Structurez votre message avec quelques paragraphes ou une liste si vous detaillez des etapes.
            </p>
          </div>
          <div className="overflow-hidden rounded-b-xl">
            <TipTapEditor
              content={body}
              onChange={setBody}
              placeholder="Ecrire une reponse utile, detaillee si necessaire, avec les informations les plus importantes en premier..."
            />
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
