"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { isDemoTourEnabled } from "@/lib/tour/flag";
import { DEMO_CHAIN_IDS, getSubjectById } from "@/lib/tour/subjects";
import { loadTourState, saveTourState } from "@/lib/tour/storage";
import type {
  TourAudience,
  TourSessionRole,
  TourStep,
  TourSubject,
  TourUiState,
} from "@/lib/tour/types";
import {
  fillDemoFields,
  matchRouteHint,
  TOUR_SUCCESS_EVENT,
  type TourSuccessDetail,
} from "@/lib/tour/validation";
import { TourPanel } from "./TourPanel";
import { TourSpotlight } from "./TourSpotlight";

type DemoTourContextValue = {
  isEnabled: boolean;
  isActive: boolean;
  uiState: TourUiState;
  audience: TourAudience | null;
  sessionRole: TourSessionRole;
  currentSubject: TourSubject | null;
  currentStep: TourStep | null;
  stepIndex: number;
  chainMode: boolean;
  /** Cible spotlight absente du DOM. */
  targetMissing: boolean;
  setTargetMissing: (missing: boolean) => void;
  openHub: () => void;
  goHub: () => void;
  goProfile: () => void;
  setAudience: (audience: TourAudience) => void;
  startSubject: (id: string) => void;
  startDemoChain: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  confirmStep: () => void;
  exitTour: () => void;
  resumeTour: () => void;
  markInterrupted: () => void;
  fillDemo: () => void;
  canAccessSubject: (subject: TourSubject) => { ok: boolean; reason?: string };
  nextChainSubjectId: string | null;
  continueChain: () => void;
};

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

export function useDemoTour(): DemoTourContextValue {
  const ctx = useContext(DemoTourContext);
  if (!ctx) {
    throw new Error("useDemoTour must be used within DemoTourProvider");
  }
  return ctx;
}

export function useDemoTourOptional(): DemoTourContextValue | null {
  return useContext(DemoTourContext);
}

type Props = {
  children: ReactNode;
  sessionRole?: TourSessionRole;
};

export function DemoTourProvider({ children, sessionRole = null }: Props) {
  const enabled = isDemoTourEnabled();
  const pathname = usePathname() ?? "/";
  const prevPathRef = useRef(pathname);
  const autoAdvancedKeyRef = useRef<string | null>(null);

  const [hydrated, setHydrated] = useState(false);
  const [resolvedSessionRole, setResolvedSessionRole] = useState<TourSessionRole>(sessionRole);
  const [uiState, setUiState] = useState<TourUiState>("closed");
  const [audience, setAudienceState] = useState<TourAudience | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [chainMode, setChainMode] = useState(false);
  const [chainIndex, setChainIndex] = useState(0);
  const [targetMissing, setTargetMissing] = useState(false);

  useEffect(() => {
    setResolvedSessionRole(sessionRole);
  }, [sessionRole]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    fetch("/api/auth/session")
      .then((response) => (response.ok ? response.json() : null))
      .then((session: { user?: { role?: string } | null } | null) => {
        if (cancelled) return;
        const role = session?.user?.role;
        setResolvedSessionRole(
          role === "ADMIN" || role === "CONTRIBUTEUR" ? role : null,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedSessionRole(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) return;
    const saved = loadTourState();
    setUiState(saved.uiState);
    setAudienceState(saved.audience);
    setSubjectId(saved.subjectId);
    setStepIndex(saved.stepIndex);
    setChainMode(saved.chainMode);
    setChainIndex(saved.chainIndex);
    setHydrated(true);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !hydrated) return;
    saveTourState({
      subjectId,
      stepIndex,
      audience,
      uiState,
      chainMode,
      chainIndex,
      updatedAt: Date.now(),
    });
  }, [enabled, hydrated, subjectId, stepIndex, audience, uiState, chainMode, chainIndex]);

  const currentSubject = useMemo(
    () => (subjectId ? (getSubjectById(subjectId) ?? null) : null),
    [subjectId],
  );
  const currentStep = currentSubject?.steps[stepIndex] ?? null;
  const isActive = uiState === "running" || uiState === "success" || uiState === "interrupted";

  const canAccessSubject = useCallback(
    (subject: TourSubject): { ok: boolean; reason?: string } => {
      const isAdminOnly =
        subject.audience.includes("ADMIN") &&
        !subject.audience.includes("CONTRIBUTEUR") &&
        !subject.audience.includes("VISITOR");
      const needsMember =
        !subject.audience.includes("VISITOR") &&
        (subject.audience.includes("CONTRIBUTEUR") || subject.audience.includes("ADMIN"));

      if (isAdminOnly && resolvedSessionRole !== "ADMIN") {
        return { ok: false, reason: "Réservé aux administrateurs" };
      }
      if (needsMember && !resolvedSessionRole) {
        return { ok: false, reason: "Connectez-vous d’abord (parcours connexion)" };
      }
      return { ok: true };
    },
    [resolvedSessionRole],
  );

  const advanceAfterStep = useCallback(
    (nextIndex: number, subject: TourSubject | null) => {
      if (!subject) return;
      if (nextIndex >= subject.steps.length) {
        setUiState("success");
        return;
      }
      setStepIndex(nextIndex);
      setUiState("running");
    },
    [],
  );

  const nextStep = useCallback(() => {
    advanceAfterStep(stepIndex + 1, currentSubject);
  }, [advanceAfterStep, stepIndex, currentSubject]);

  const prevStep = useCallback(() => {
    if (stepIndex <= 0) {
      setUiState("hub-subjects");
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
    setUiState("running");
  }, [stepIndex]);

  const skipStep = useCallback(() => {
    advanceAfterStep(stepIndex + 1, currentSubject);
  }, [advanceAfterStep, stepIndex, currentSubject]);

  const confirmStep = useCallback(() => {
    if (!currentStep) return;
    if (currentStep.action === "confirm" || currentStep.optional) {
      nextStep();
    }
  }, [currentStep, nextStep]);

  const openHub = useCallback(() => {
    setUiState(audience ? "hub-subjects" : "hub-profile");
  }, [audience]);

  const goHub = useCallback(() => {
    setSubjectId(null);
    setStepIndex(0);
    setUiState(audience ? "hub-subjects" : "hub-profile");
  }, [audience]);

  const goProfile = useCallback(() => {
    setSubjectId(null);
    setStepIndex(0);
    setAudienceState(null);
    setUiState("hub-profile");
  }, []);

  const setAudience = useCallback((next: TourAudience) => {
    setAudienceState(next);
    setUiState("hub-subjects");
  }, []);

  const startSubject = useCallback(
    (id: string) => {
      const subject = getSubjectById(id);
      if (!subject) return;
      if (!canAccessSubject(subject).ok) return;
      setSubjectId(id);
      setStepIndex(0);
      setUiState("running");
      const idx = DEMO_CHAIN_IDS.indexOf(id);
      if (idx >= 0) setChainIndex(idx);
    },
    [canAccessSubject],
  );

  const resolveNextChainId = useCallback(
    (fromIndex: number): { id: string | null; index: number } => {
      for (let i = fromIndex + 1; i < DEMO_CHAIN_IDS.length; i++) {
        const id = DEMO_CHAIN_IDS[i];
        const subject = getSubjectById(id);
        if (!subject) continue;
        if (!canAccessSubject(subject).ok) continue;
        return { id, index: i };
      }
      return { id: null, index: fromIndex };
    },
    [canAccessSubject],
  );

  const startDemoChain = useCallback(() => {
    setChainMode(true);
    setAudienceState(
      resolvedSessionRole === "ADMIN"
        ? "ADMIN"
        : resolvedSessionRole === "CONTRIBUTEUR"
          ? "CONTRIBUTEUR"
          : "VISITOR",
    );
    const first = resolveNextChainId(-1);
    if (!first.id) {
      setUiState("hub-profile");
      return;
    }
    setChainIndex(first.index);
    setSubjectId(first.id);
    setStepIndex(0);
    setUiState("running");
  }, [resolveNextChainId, resolvedSessionRole]);

  const nextChainSubjectId = useMemo(() => {
    if (!chainMode) return null;
    return resolveNextChainId(chainIndex).id;
  }, [chainMode, chainIndex, resolveNextChainId]);

  const continueChain = useCallback(() => {
    const next = resolveNextChainId(chainIndex);
    if (!next.id) {
      setChainMode(false);
      setUiState("hub-subjects");
      return;
    }
    setChainIndex(next.index);
    setSubjectId(next.id);
    setStepIndex(0);
    setUiState("running");
  }, [chainIndex, resolveNextChainId]);

  const exitTour = useCallback(() => {
    setUiState("closed");
    setSubjectId(null);
    setStepIndex(0);
    setChainMode(false);
  }, []);

  const resumeTour = useCallback(() => {
    if (subjectId && getSubjectById(subjectId)) {
      setUiState("running");
      return;
    }
    openHub();
  }, [subjectId, openHub]);

  const markInterrupted = useCallback(() => {
    setUiState((s) => (s === "running" ? "interrupted" : s));
  }, []);

  const fillDemo = useCallback(() => {
    if (currentStep?.fillDemo) fillDemoFields(currentStep.fillDemo);
  }, [currentStep]);

  // Auto-advance navigate / success-via-route
  useEffect(() => {
    if (!enabled || uiState !== "running" || !currentStep || !subjectId) return;
    const key = `${subjectId}:${stepIndex}:${pathname}:${currentStep.action}`;
    if (autoAdvancedKeyRef.current === key) return;

    if (currentStep.action === "navigate" && matchRouteHint(pathname, currentStep.routeHint)) {
      autoAdvancedKeyRef.current = key;
      nextStep();
      return;
    }
    if (
      currentStep.action === "success" &&
      currentStep.routeHint &&
      matchRouteHint(pathname, currentStep.routeHint)
    ) {
      autoAdvancedKeyRef.current = key;
      nextStep();
    }
  }, [enabled, uiState, currentStep, pathname, nextStep, subjectId, stepIndex]);

  // Interrupted: left expected route area without matching step
  useEffect(() => {
    if (!enabled || uiState !== "running" || !currentSubject || !currentStep) {
      prevPathRef.current = pathname;
      return;
    }
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prev === pathname) return;

    // Expected transitions (navigate/click/success) should not interrupt
    if (currentStep.action === "navigate" || currentStep.action === "click") return;
    if (currentStep.routeHint && matchRouteHint(pathname, currentStep.routeHint)) return;

    const hints = currentSubject.steps
      .map((s) => s.routeHint)
      .filter((h): h is string => Boolean(h));
    if (hints.length === 0) return;

    const related = hints.some((h) => matchRouteHint(pathname, h));
    if (!related) markInterrupted();
  }, [enabled, uiState, currentSubject, currentStep, pathname, markInterrupted]);

  // click / input / success listeners
  useEffect(() => {
    if (!enabled || uiState !== "running" || !currentStep) return;
    const targetId = currentStep.target;

    const onClickCapture = (event: MouseEvent) => {
      const el = event.target as Element | null;
      if (!el?.closest(`[data-tour-id="${targetId}"]`)) return;
      if (currentStep.action === "click") {
        window.setTimeout(() => nextStep(), 0);
        return;
      }
      // Sélection catégorie / chips : clic dans une cible `input` sans champ texte
      if (currentStep.action === "input") {
        const field = el.closest("input, textarea, [contenteditable='true']");
        if (!field) {
          window.setTimeout(() => nextStep(), 0);
        }
      }
    };

    const onInput = (event: Event) => {
      if (currentStep.action !== "input") return;
      const el = event.target as HTMLElement | null;
      if (!el) return;
      const inTarget =
        el.closest(`[data-tour-id="${targetId}"]`) ||
        (el.getAttribute("data-tour-id") === targetId ? el : null);
      if (!inTarget) return;

      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        if (el.value.trim().length > 0) nextStep();
        return;
      }
      if (el.isContentEditable && (el.textContent ?? "").trim().length > 0) {
        nextStep();
        return;
      }
      if (event.type === "change") nextStep();
    };

    /**
     * success : event bus `meeed:tour-success` émis depuis les points déjà toastés
     * (publication article, login, upload…). Fallback routeHint géré ci-dessus.
     */
    const onSuccess = (event: Event) => {
      if (currentStep.action !== "success") return;
      const detail = (event as CustomEvent<TourSuccessDetail>).detail ?? {};
      if (detail.target && detail.target !== targetId) return;
      if (detail.subjectId && detail.subjectId !== subjectId) return;
      nextStep();
    };

    document.addEventListener("click", onClickCapture, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    window.addEventListener(TOUR_SUCCESS_EVENT, onSuccess);

    return () => {
      document.removeEventListener("click", onClickCapture, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
      window.removeEventListener(TOUR_SUCCESS_EVENT, onSuccess);
    };
  }, [enabled, uiState, currentStep, nextStep, subjectId]);

  // Escape
  useEffect(() => {
    if (!enabled || uiState === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (uiState === "hub-profile" || uiState === "hub-subjects") {
        setUiState("closed");
      } else {
        exitTour();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, uiState, exitTour]);

  // Reset missing flag when step changes
  useEffect(() => {
    setTargetMissing(false);
  }, [subjectId, stepIndex]);

  const value = useMemo<DemoTourContextValue>(
    () => ({
      isEnabled: enabled,
      isActive,
      uiState,
      audience,
      sessionRole: resolvedSessionRole,
      currentSubject,
      currentStep,
      stepIndex,
      chainMode,
      targetMissing,
      setTargetMissing,
      openHub,
      goHub,
      goProfile,
      setAudience,
      startSubject,
      startDemoChain,
      nextStep,
      prevStep,
      skipStep,
      confirmStep,
      exitTour,
      resumeTour,
      markInterrupted,
      fillDemo,
      canAccessSubject,
      nextChainSubjectId,
      continueChain,
    }),
    [
      enabled,
      isActive,
      uiState,
      audience,
      resolvedSessionRole,
      currentSubject,
      currentStep,
      stepIndex,
      chainMode,
      targetMissing,
      openHub,
      goHub,
      goProfile,
      setAudience,
      startSubject,
      startDemoChain,
      nextStep,
      prevStep,
      skipStep,
      confirmStep,
      exitTour,
      resumeTour,
      markInterrupted,
      fillDemo,
      canAccessSubject,
      nextChainSubjectId,
      continueChain,
    ],
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <DemoTourContext.Provider value={value}>
      {children}
      {hydrated ? (
        uiState !== "closed" ? (
          <>
            <TourPanel />
            {uiState === "running" ? <TourSpotlight /> : null}
          </>
        ) : null
      ) : null}
    </DemoTourContext.Provider>
  );
}
