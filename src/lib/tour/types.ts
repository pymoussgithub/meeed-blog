export type TourAudience = "VISITOR" | "CONTRIBUTEUR" | "ADMIN";

export type TourStepAction = "click" | "input" | "navigate" | "confirm" | "success";

export type TourUiState =
  | "hub-profile"
  | "hub-subjects"
  | "running"
  | "success"
  | "interrupted"
  | "closed";

export type TourStep = {
  id: string;
  message: string;
  target: string;
  action: TourStepAction;
  routeHint?: string;
  optional?: boolean;
  fallbackMessage?: string;
  /** Valeurs fictives pour le mode « Remplir pour moi » (clés = data-tour-id). */
  fillDemo?: Record<string, string>;
};

export type TourSubject = {
  id: string;
  label: string;
  description: string;
  audience: TourAudience[];
  steps: TourStep[];
  nextSuggested?: string[];
};

export type TourPersistedState = {
  subjectId: string | null;
  stepIndex: number;
  audience: TourAudience | null;
  uiState: TourUiState;
  chainMode: boolean;
  chainIndex: number;
  updatedAt: number;
};

export type TourSessionRole = "ADMIN" | "CONTRIBUTEUR" | null;
