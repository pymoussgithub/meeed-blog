import type { TourPersistedState, TourUiState, TourAudience } from "@/lib/tour/types";

export const TOUR_STORAGE_KEY = "meeed.demo-tour.v1";

const DEFAULT: TourPersistedState = {
  subjectId: null,
  stepIndex: 0,
  audience: null,
  uiState: "closed",
  chainMode: false,
  chainIndex: 0,
  updatedAt: 0,
};

export function loadTourState(): TourPersistedState {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(TOUR_STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<TourPersistedState>;
    return {
      subjectId: parsed.subjectId ?? null,
      stepIndex: typeof parsed.stepIndex === "number" ? parsed.stepIndex : 0,
      audience: (parsed.audience as TourAudience | null) ?? null,
      uiState: (parsed.uiState as TourUiState) ?? "closed",
      chainMode: Boolean(parsed.chainMode),
      chainIndex: typeof parsed.chainIndex === "number" ? parsed.chainIndex : 0,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveTourState(state: TourPersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      TOUR_STORAGE_KEY,
      JSON.stringify({ ...state, updatedAt: Date.now() }),
    );
  } catch {
    // ignore quota / private mode
  }
}

export function clearTourState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOUR_STORAGE_KEY);
  } catch {
    // ignore
  }
}
