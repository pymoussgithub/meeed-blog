"use client";

import { cn } from "@/lib/utils";

type ComposerStat = {
  label: string;
  value: string;
  tone?: "default" | "accent" | "muted";
};

type ComposerChecklistItem = {
  label: string;
  done: boolean;
  helper?: string;
};

type ComposerPanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  stats?: ComposerStat[];
  checklistTitle?: string;
  checklistDescription?: string;
  checklistItems?: ComposerChecklistItem[];
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function ComposerPanel({
  eyebrow,
  title,
  description,
  stats = [],
  checklistTitle = "Avant de publier",
  checklistDescription,
  checklistItems = [],
  sidebar,
  children,
  footer,
  className,
}: ComposerPanelProps) {
  return (
    <section className={cn("space-y-5", className)}>
      <div className="overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-white via-bg-soft/55 to-accent/10 shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-dark">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 font-heading text-2xl font-bold text-primary-dark sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary/65">
                {description}
              </p>
            ) : null}
          </div>

          {stats.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "min-w-[7.5rem] rounded-2xl border px-3 py-2 shadow-sm",
                    stat.tone === "accent"
                      ? "border-accent/20 bg-white text-accent-dark"
                      : stat.tone === "muted"
                        ? "border-primary/8 bg-white/75 text-primary/55"
                        : "border-primary/10 bg-white text-primary-dark",
                  )}
                >
                  <p className="text-[11px] uppercase tracking-wide text-current/70">{stat.label}</p>
                  <p className="mt-1 text-base font-semibold text-current">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            {children}
          </div>
          {footer ? <div className="flex flex-wrap items-center gap-3">{footer}</div> : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          {checklistItems.length > 0 ? (
            <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-primary-dark">{checklistTitle}</h3>
              {checklistDescription ? (
                <p className="mt-1 text-xs leading-relaxed text-primary/55">{checklistDescription}</p>
              ) : null}
              <ul className="mt-4 space-y-3">
                {checklistItems.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                        item.done
                          ? "border-accent/20 bg-accent text-white"
                          : "border-primary/15 bg-bg-soft text-primary/45",
                      )}
                      aria-hidden="true"
                    >
                      {item.done ? "OK" : "!"}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-primary-dark">{item.label}</p>
                      {item.helper ? (
                        <p className="mt-0.5 text-xs leading-relaxed text-primary/55">{item.helper}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {sidebar}
        </aside>
      </div>
    </section>
  );
}
