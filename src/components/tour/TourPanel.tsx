"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getContextSubjectIds,
  getSubjectById,
  getSubjectsForAudience,
} from "@/lib/tour/subjects";
import type { TourAudience, TourStepAction, TourSubject } from "@/lib/tour/types";
import { useDemoTour } from "./DemoTourProvider";

const PROFILE_OPTIONS: { audience: TourAudience; label: string; hint: string }[] = [
  { audience: "VISITOR", label: "Je découvre le site", hint: "Menu site public" },
  { audience: "CONTRIBUTEUR", label: "Je suis contributeur", hint: "Espace membre" },
  { audience: "ADMIN", label: "Je suis administrateur", hint: "Espace admin" },
];

function actionHint(action: TourStepAction, isFirstStep: boolean): string {
  if (isFirstStep) {
    if (action === "input") return "Saisissez dans le champ encadré en vert.";
    if (action === "confirm") return "Observez la zone encadrée en vert, puis validez.";
    return "Cliquez dans le cadre vert sur la page.";
  }
  switch (action) {
    case "click":
    case "navigate":
      return "Cliquez sur la zone encadrée en vert.";
    case "input":
      return "Saisissez dans le champ encadré.";
    case "success":
      return "Validez l’action sur la zone encadrée.";
    case "confirm":
      return "Observez la zone encadrée, puis continuez.";
    default:
      return "";
  }
}

/**
 * Panneau flottant unique — messages, hints et fallbacks (pas de 2e cadre).
 * z-[60] au-dessus spotlight (55).
 */
export function TourPanel() {
  const pathname = usePathname() ?? "/";
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    uiState,
    audience,
    setAudience,
    goProfile,
    startSubject,
    startDemoChain,
    currentSubject,
    currentStep,
    stepIndex,
    goHub,
    prevStep,
    skipStep,
    confirmStep,
    exitTour,
    resumeTour,
    fillDemo,
    canAccessSubject,
    chainMode,
    nextChainSubjectId,
    continueChain,
    targetMissing,
  } = useDemoTour();

  const [panelSide, setPanelSide] = useState<"left" | "right">("right");

  useEffect(() => {
    if (uiState === "closed") return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [uiState, stepIndex]);

  // Suit le côté décidé par le spotlight pour ne pas masquer la cible
  useEffect(() => {
    if (uiState !== "running") {
      setPanelSide("right");
      return;
    }
    const read = () => {
      const side = document.documentElement.dataset.tourPanelSide;
      setPanelSide(side === "left" ? "left" : "right");
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-tour-panel-side"],
    });
    return () => observer.disconnect();
  }, [uiState, stepIndex, currentStep?.target]);

  const subjects = audience ? getSubjectsForAudience(audience) : [];
  const contextSubjects = getContextSubjectIds(pathname)
    .map((id) => getSubjectById(id))
    .filter((s): s is TourSubject => Boolean(s));

  const sideClass =
    uiState === "running" && panelSide === "left"
      ? "sm:left-4 sm:right-auto"
      : "sm:right-4 sm:left-auto";

  const sizeClass =
    uiState === "running"
      ? "max-h-[min(50vh,26rem)] sm:max-h-[min(32rem,75vh)]"
      : "max-h-[70vh] sm:max-h-[min(36rem,85vh)]";

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Assistant de démonstration"
      className={`fixed inset-x-0 bottom-0 z-[60] flex flex-col rounded-t-2xl border border-primary/10 bg-white shadow-2xl sm:inset-x-auto sm:bottom-4 sm:w-[26rem] sm:rounded-2xl ${sideClass} ${sizeClass}`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="font-heading text-sm font-bold text-primary">Démo guidée MEEED</p>
        <button
          type="button"
          onClick={exitTour}
          className="rounded-full px-2 py-1 text-xs text-primary/70 hover:bg-gray-100 hover:text-primary"
        >
          Quitter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {uiState === "hub-profile" ? (
          <div className="space-y-3">
            <p className="text-sm text-primary/80">Choisissez votre profil pour commencer.</p>
            {PROFILE_OPTIONS.map((opt) => (
              <button
                key={opt.audience}
                type="button"
                onClick={() => setAudience(opt.audience)}
                className="flex w-full flex-col rounded-xl border border-gray-200 px-3 py-3 text-left transition hover:border-accent hover:bg-bg-soft/50"
              >
                <span className="text-sm font-medium text-primary">{opt.label}</span>
                <span className="text-xs text-primary/60">{opt.hint}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={startDemoChain}
              className="w-full rounded-xl bg-accent px-3 py-3 text-sm font-medium text-white hover:bg-accent-dark"
            >
              Démo complète (présentation)
            </button>
          </div>
        ) : null}

        {uiState === "hub-subjects" && audience ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-primary">
                {audience === "VISITOR"
                  ? "Site public"
                  : audience === "CONTRIBUTEUR"
                    ? "Espace membre"
                    : "Espace admin"}
              </p>
              <button
                type="button"
                onClick={goProfile}
                className="text-xs text-accent-dark underline"
              >
                Changer de profil
              </button>
            </div>

            {contextSubjects.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary/50">
                  Sur cette page
                </p>
                <SubjectGrid
                  subjects={contextSubjects}
                  startSubject={startSubject}
                  canAccessSubject={canAccessSubject}
                />
              </div>
            ) : null}

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary/50">
                Tous les sujets
              </p>
              <SubjectGrid
                subjects={subjects}
                startSubject={startSubject}
                canAccessSubject={canAccessSubject}
              />
            </div>
          </div>
        ) : null}

        {uiState === "running" && currentSubject && currentStep ? (
          <div className="space-y-3">
            <p className="text-xs text-primary/50">
              {currentSubject.label} — étape {stepIndex + 1}/{currentSubject.steps.length}
            </p>
            <p className="text-sm leading-relaxed text-primary">{currentStep.message}</p>

            {!targetMissing ? (
              <p className="rounded-lg border border-accent/30 bg-bg-soft/60 px-3 py-2 text-sm text-accent-dark">
                {actionHint(currentStep.action, stepIndex === 0)}
              </p>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-sm text-primary">
                  {currentStep.fallbackMessage ??
                    "Élément introuvable sur cette page. Naviguez vers la bonne section ou passez à l’étape suivante."}
                </p>
              </div>
            )}

            {currentStep.action === "confirm" && !targetMissing ? (
              <button
                type="button"
                onClick={confirmStep}
                className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
              >
                J’ai compris
              </button>
            ) : null}
            {currentStep.action === "input" && currentStep.fillDemo && !targetMissing ? (
              <button
                type="button"
                onClick={fillDemo}
                className="w-full rounded-full border-2 border-accent px-4 py-2 text-sm font-medium text-accent-dark hover:bg-bg-soft"
              >
                Remplir pour moi
              </button>
            ) : null}
          </div>
        ) : null}

        {uiState === "success" && currentSubject ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Parcours terminé</p>
            <p className="text-sm text-primary/80">
              Bravo — « {currentSubject.label} » est complété.
            </p>
            {chainMode && nextChainSubjectId ? (
              <button
                type="button"
                onClick={continueChain}
                className="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-dark"
              >
                Continuer la démo
              </button>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(currentSubject.nextSuggested ?? []).map((id) => {
                const s = getSubjectById(id);
                if (!s) return null;
                const access = canAccessSubject(s);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!access.ok}
                    title={access.reason}
                    onClick={() => startSubject(id)}
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-primary hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={goHub} className="text-sm text-accent-dark underline">
              Menu sujets
            </button>
          </div>
        ) : null}

        {uiState === "interrupted" ? (
          <div className="space-y-3">
            <p className="text-sm text-primary">Vous avez quitté le parcours.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resumeTour}
                className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
              >
                Reprendre
              </button>
              <button
                type="button"
                onClick={exitTour}
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm text-primary hover:bg-gray-50"
              >
                Quitter
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {uiState === "running" ? (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3">
          <button
            type="button"
            onClick={goHub}
            className="rounded-full px-3 py-1.5 text-xs text-primary/70 hover:bg-gray-100"
          >
            Menu sujets
          </button>
          <button
            type="button"
            onClick={prevStep}
            className="rounded-full px-3 py-1.5 text-xs text-primary/70 hover:bg-gray-100"
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={skipStep}
            className="ml-auto rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-dark"
          >
            Suivant
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SubjectGrid({
  subjects,
  startSubject,
  canAccessSubject,
}: {
  subjects: TourSubject[];
  startSubject: (id: string) => void;
  canAccessSubject: (s: TourSubject) => { ok: boolean; reason?: string };
}) {
  if (subjects.length === 0) {
    return <p className="text-sm text-primary/60">Aucun sujet disponible pour ce profil.</p>;
  }
  return (
    <div className="grid gap-2">
      {subjects.map((subject) => {
        const access = canAccessSubject(subject);
        return (
          <button
            key={subject.id}
            type="button"
            disabled={!access.ok}
            title={access.reason}
            onClick={() => startSubject(subject.id)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-left transition hover:border-accent hover:bg-bg-soft/40 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span className="block text-sm font-medium text-primary">{subject.label}</span>
            <span className="block text-xs text-primary/55">{subject.description}</span>
            {!access.ok && access.reason ? (
              <span className="mt-1 block text-xs text-amber-700">{access.reason}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
