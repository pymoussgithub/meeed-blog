"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type CollapsibleArticlesSectionProps = {
  title: string;
  count: number;
  href: string;
  color?: string | null;
  defaultOpen?: boolean;
  children: ReactNode;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4 transition-transform duration-200", open ? "rotate-180" : "rotate-0")}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CollapsibleArticlesSection({
  title,
  count,
  href,
  color,
  defaultOpen = true,
  children,
}: CollapsibleArticlesSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const accent = color || "var(--color-accent-dark)";
  const accentIsHex = typeof accent === "string" && accent.startsWith("#");

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2
          className="shrink-0 text-sm font-bold uppercase tracking-wider"
          style={{ color: accent }}
        >
          {title}
        </h2>

        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors hover:opacity-90"
          style={{
            color: accent,
            borderColor: accentIsHex ? `${accent}40` : "currentColor",
            backgroundColor: accentIsHex ? `${accent}12` : "transparent",
          }}
          aria-label={`Voir tous les articles de ${title} (${count})`}
        >
          <span className="hidden sm:inline">Voir tous les articles</span>
          <span className="sm:hidden">Voir tous</span>
          <span
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold tabular-nums text-white"
            style={{ backgroundColor: accent }}
          >
            {count}
          </span>
        </Link>

        <span className="h-px flex-1 bg-current opacity-15" style={{ color: accent }} aria-hidden />

        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls={panelId}
          title={open ? `Replier ${title}` : `Déplier ${title}`}
          aria-label={open ? `Replier la section ${title}` : `Déplier la section ${title}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors hover:opacity-90"
          style={{
            color: accent,
            borderColor: accentIsHex ? `${accent}40` : "currentColor",
            backgroundColor: accentIsHex ? `${accent}18` : "transparent",
          }}
        >
          <ChevronIcon open={open} />
        </button>
      </div>

      <div
        id={panelId}
        className={cn(
          "origin-top transition-[opacity,transform] duration-200 ease-out",
          open ? "translate-y-0 opacity-100" : "hidden",
        )}
      >
        {open ? children : null}
      </div>
    </section>
  );
}
