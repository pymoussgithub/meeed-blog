"use client";

import { useState } from "react";
import { Toast } from "@/components/ui/Toast";

type ShareBarProps = {
  title: string;
  url: string;
};

export function ShareBar({ title, url }: ShareBarProps) {
  const [toast, setToast] = useState<string | null>(null);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setToast("Lien copié !");
    } catch {
      setToast("Impossible de copier le lien");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-medium text-[#128C7E] transition-opacity hover:opacity-80"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center rounded-full bg-bg-soft px-2.5 py-0.5 text-xs font-medium text-accent-dark transition-opacity hover:opacity-80"
          data-tour-id="article.share.copy-link"
        >
          Copier le lien
        </button>
      </div>

      <Toast
        message={toast ?? ""}
        visible={Boolean(toast)}
        variant="success"
        onClose={() => setToast(null)}
      />
    </>
  );
}
