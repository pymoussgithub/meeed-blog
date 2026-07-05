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
      <div className="sticky bottom-4 z-30 mx-auto flex max-w-md items-center justify-center gap-2 rounded-full border border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur md:static md:max-w-none md:justify-start md:rounded-xl md:shadow-sm">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-primary-dark transition-colors hover:bg-gray-50"
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
