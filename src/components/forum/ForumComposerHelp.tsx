"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";

const DOCUMENT_MAX_MO = Math.round(UPLOAD_LIMITS.documentMaxBytes / (1024 * 1024));

type ForumComposerHelpProps = {
  /** Contexte d’affichage : réponse ou nouveau sujet */
  context?: "reply" | "topic";
};

export function ForumComposerHelp({ context = "reply" }: ForumComposerHelpProps) {
  const [open, setOpen] = useState(false);
  const buttonLabel = context === "topic" ? "Aide à la rédaction" : "Aide à la réponse";
  const title =
    context === "topic" ? "Rédiger un message de sujet" : "Rédiger une réponse";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-tour-id="forum.composer.help"
        className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-accent/25 bg-gradient-to-b from-accent/10 to-accent/5 px-3.5 py-2 text-xs font-semibold text-accent-dark shadow-sm transition-all hover:border-accent/45 hover:from-accent/15 hover:to-accent/10 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        <span
          aria-hidden
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white shadow-sm transition-transform group-hover:scale-105"
        >
          ?
        </span>
        {buttonLabel}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className="flex max-h-[min(90dvh,36rem)] max-w-lg flex-col overflow-hidden rounded-3xl p-0"
        data-tour-id="forum.composer.help-modal"
      >
        <div className="shrink-0 border-b border-primary/8 px-6 pb-3 pr-14 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark">
            Éditeur forum
          </p>
          <h2 id="modal-title" className="mt-1 text-lg font-bold text-primary-dark">
            {title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-primary/55">
            Structurez le texte et joignez une image ou un PDF directement dans le message.
          </p>
        </div>

        <div className="scrollbar-meeed min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/45">
              Mise en forme
            </h3>
            <ul className="space-y-2.5 text-sm leading-relaxed text-primary/75">
              <li className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 text-accent">
                  •
                </span>
                <span>
                  <span className="font-medium text-primary-dark">Gras / italique</span> via les
                  boutons, ou{" "}
                  <kbd className="rounded-md border border-primary/10 bg-bg-soft px-1.5 py-0.5 text-[11px]">
                    Ctrl+B
                  </kbd>{" "}
                  /{" "}
                  <kbd className="rounded-md border border-primary/10 bg-bg-soft px-1.5 py-0.5 text-[11px]">
                    Ctrl+I
                  </kbd>
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 text-accent">
                  •
                </span>
                <span>
                  <span className="font-medium text-primary-dark">H2 / H3</span> pour structurer un
                  message long
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 text-accent">
                  •
                </span>
                <span>
                  <span className="font-medium text-primary-dark">Listes</span> à puces ou numérotées
                  pour détailler des étapes
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 text-accent">
                  •
                </span>
                <span>
                  <span className="font-medium text-primary-dark">Lien</span> : icône chaîne —
                  sélectionnez d&apos;abord le texte à transformer
                </span>
              </li>
            </ul>
          </section>

          <section className="space-y-3 rounded-2xl border border-accent/20 bg-accent/5 p-4">
            <h3 className="text-sm font-semibold text-primary-dark">Joindre un document (PDF)</h3>
            <ol className="space-y-2.5 text-sm leading-relaxed text-primary/75">
              <li className="flex gap-2.5">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent-dark">
                  1
                </span>
                <span>
                  Dans la barre d&apos;outils, cliquez sur l&apos;icône{" "}
                  <span className="inline-flex items-center gap-1 font-medium text-primary-dark">
                    document
                    <span
                      aria-hidden
                      className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-primary/15 bg-white text-primary/70 shadow-sm"
                    >
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7zm0 2.5L16.5 7H14zM8 13h8v1.5H8zm0 3h8v1.5H8zm0-6h4v1.5H8z" />
                      </svg>
                    </span>
                  </span>{" "}
                  (à droite de l&apos;icône image).
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent-dark">
                  2
                </span>
                <span>
                  Choisissez votre fichier (PDF recommandé, max {DOCUMENT_MAX_MO}&nbsp;Mo).
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[11px] font-bold text-accent-dark">
                  3
                </span>
                <span>
                  Un lien cliquable est inséré avec le nom du fichier. Le lien est aussi copié dans
                  le presse-papiers.
                </span>
              </li>
            </ol>
            <p className="rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-primary/55">
              Astuce : sélectionnez d&apos;abord un bout de texte pour qu&apos;il serve de libellé
              au lien, au lieu du nom du fichier.
            </p>
          </section>

          <section className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-primary/45">
              Images
            </h3>
            <ul className="space-y-2.5 text-sm leading-relaxed text-primary/75">
              <li className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 text-accent">
                  •
                </span>
                <span>
                  Bouton image dans la barre d&apos;outils, ou glisser-déposer / coller dans
                  l&apos;éditeur
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden className="mt-0.5 text-accent">
                  •
                </span>
                <span>Formats : JPEG, PNG, WebP, GIF — max 10&nbsp;Mo</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="shrink-0 border-t border-primary/8 px-6 py-4">
          <Button
            type="button"
            variant="accent"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto sm:min-w-[8.5rem]"
          >
            Compris
          </Button>
        </div>
      </Modal>
    </>
  );
}
