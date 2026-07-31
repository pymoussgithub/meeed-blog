"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  "data-tour-id"?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  "data-tour-id": dataTourId,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        data-tour-id={dataTourId}
        className={cn(
          "relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Fermer la fenêtre"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-primary/70 shadow-sm transition-colors hover:bg-gray-50 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <span aria-hidden className="text-lg leading-none">
            ×
          </span>
        </button>
        {title ? (
          <h2 id="modal-title" className="mb-3 pr-14 text-lg font-bold text-primary-dark">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
