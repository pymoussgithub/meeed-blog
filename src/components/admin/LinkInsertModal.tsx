"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

export type LinkInsertValues = {
  text: string;
  url: string;
};

type LinkInsertModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: LinkInsertValues) => void;
  initialText?: string;
  initialUrl?: string;
};

export function LinkInsertModal({
  open,
  onClose,
  onConfirm,
  initialText = "",
  initialUrl = "https://",
}: LinkInsertModalProps) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [textError, setTextError] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setText(initialText);
    setUrl(initialUrl);
    setTextError(undefined);
  }, [open, initialText, initialUrl]);

  const handleConfirm = () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      onConfirm({ text: "", url: "" });
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      setTextError("Indiquez le texte affiché dans l'article.");
      return;
    }

    onConfirm({ text: trimmedText, url: trimmedUrl });
  };

  return (
    <Modal open={open} onClose={onClose} title="Insérer un lien">
      <div className="space-y-4">
        <Input
          label="Texte affiché"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (textError) setTextError(undefined);
          }}
          placeholder="Texte visible dans l'article"
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleConfirm();
            }
          }}
          error={textError}
        />

        <Input
          label="Adresse (URL)"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://exemple.com"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleConfirm();
            }
          }}
        />

        <p className="text-xs text-primary/60">
          Laissez l&apos;URL vide pour supprimer un lien existant.
        </p>

        <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} className="rounded-lg">
            Annuler
          </Button>
          <Button type="button" variant="accent" onClick={handleConfirm} className="rounded-lg">
            Appliquer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
