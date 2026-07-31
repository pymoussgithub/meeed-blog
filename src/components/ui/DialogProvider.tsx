"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  /** Si défini, l'utilisateur doit saisir exactement ce texte pour activer la confirmation. */
  requireText?: string;
};

type AlertOptions = {
  title?: string;
  confirmLabel?: string;
  variant?: "default" | "error";
};

type PromptOptions = {
  title?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type DialogContextValue = {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  alert: (message: string, options?: AlertOptions) => Promise<void>;
  prompt: (message: string, options?: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

type DialogState =
  | {
      type: "confirm";
      message: string;
      title: string;
      confirmLabel: string;
      cancelLabel: string;
      variant: "default" | "danger";
      requireText?: string;
      resolve: (value: boolean) => void;
    }
  | {
      type: "alert";
      message: string;
      title: string;
      confirmLabel: string;
      variant: "default" | "error";
      resolve: () => void;
    }
  | {
      type: "prompt";
      message: string;
      title: string;
      defaultValue: string;
      placeholder: string;
      confirmLabel: string;
      cancelLabel: string;
      resolve: (value: string | null) => void;
    };

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [typedText, setTypedText] = useState("");
  const promptInputRef = useRef<HTMLInputElement>(null);

  const confirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setTypedText("");
      setDialog({
        type: "confirm",
        message,
        title: options?.title ?? "Confirmation",
        confirmLabel: options?.confirmLabel ?? "Confirmer",
        cancelLabel: options?.cancelLabel ?? "Annuler",
        variant: options?.variant ?? "default",
        requireText: options?.requireText,
        resolve,
      });
    });
  }, []);

  const alert = useCallback((message: string, options?: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setDialog({
        type: "alert",
        message,
        title: options?.title ?? (options?.variant === "error" ? "Erreur" : "Information"),
        confirmLabel: options?.confirmLabel ?? "OK",
        variant: options?.variant ?? "default",
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((message: string, options?: PromptOptions) => {
    return new Promise<string | null>((resolve) => {
      setDialog({
        type: "prompt",
        message,
        title: options?.title ?? "Saisie",
        defaultValue: options?.defaultValue ?? "",
        placeholder: options?.placeholder ?? "",
        confirmLabel: options?.confirmLabel ?? "Valider",
        cancelLabel: options?.cancelLabel ?? "Annuler",
        resolve,
      });
    });
  }, []);

  const closeDialog = () => {
    setDialog(null);
    setTypedText("");
  };

  const handleConfirm = () => {
    if (!dialog) return;

    if (dialog.type === "confirm") {
      if (dialog.requireText && typedText.trim() !== dialog.requireText) return;
      dialog.resolve(true);
    } else if (dialog.type === "alert") {
      dialog.resolve();
    } else {
      const value = promptInputRef.current?.value ?? dialog.defaultValue;
      dialog.resolve(value);
    }

    closeDialog();
  };

  const handleCancel = () => {
    if (!dialog) return;

    if (dialog.type === "confirm") {
      dialog.resolve(false);
    } else if (dialog.type === "prompt") {
      dialog.resolve(null);
    } else {
      dialog.resolve();
    }

    closeDialog();
  };

  const promptValue =
    dialog?.type === "prompt" ? dialog.defaultValue : undefined;

  const requireText =
    dialog?.type === "confirm" ? dialog.requireText : undefined;
  const confirmEnabled =
    !requireText || typedText.trim() === requireText;

  useEffect(() => {
    if (dialog?.type === "confirm" && dialog.requireText) {
      setTypedText("");
    }
  }, [dialog]);

  return (
    <DialogContext.Provider value={{ confirm, alert, prompt }}>
      {children}

      <Modal
        open={dialog !== null}
        onClose={handleCancel}
        title={dialog?.title}
      >
        {dialog ? (
          <div className="space-y-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-primary/80">
              {dialog.message}
            </p>

            {dialog.type === "prompt" ? (
              <Input
                key={promptValue}
                ref={promptInputRef}
                defaultValue={promptValue}
                placeholder={dialog.placeholder}
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleConfirm();
                  }
                }}
              />
            ) : null}

            {dialog.type === "confirm" && dialog.requireText ? (
              <div className="space-y-2">
                <p className="text-sm text-primary/70">
                  Pour confirmer, tapez{" "}
                  <span className="font-semibold text-primary-dark">
                    {dialog.requireText}
                  </span>{" "}
                  ci-dessous.
                </p>
                <Input
                  value={typedText}
                  onChange={(event) => setTypedText(event.target.value)}
                  placeholder={dialog.requireText}
                  autoFocus
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      if (confirmEnabled) handleConfirm();
                    }
                  }}
                />
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {dialog.type !== "alert" ? (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {dialog.cancelLabel}
                </Button>
              ) : null}

              <Button
                type="button"
                variant={
                  dialog.type === "confirm" && dialog.variant === "danger"
                    ? "primary"
                    : dialog.type === "alert" && dialog.variant === "error"
                      ? "primary"
                      : "accent"
                }
                className={
                  (dialog.type === "confirm" && dialog.variant === "danger") ||
                  (dialog.type === "alert" && dialog.variant === "error")
                    ? "bg-red-600 hover:bg-red-700"
                    : undefined
                }
                disabled={dialog.type === "confirm" && !confirmEnabled}
                onClick={handleConfirm}
              >
                {dialog.confirmLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog doit être utilisé dans un DialogProvider");
  }
  return context;
}

/** Variante tolérante pour les pages hors admin (ex. forum public). */
export function useOptionalDialog() {
  return useContext(DialogContext);
}
