import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toDate(date: Date | string | null | undefined): Date | null {
  if (date == null) return null;
  const value = typeof date === "string" ? new Date(date) : date;
  return Number.isNaN(value.getTime()) ? null : value;
}

/** Attribut HTML `datetime` ; tolère les Date sérialisées en string (unstable_cache). */
export function toDateTimeAttr(date: Date | string | null | undefined): string | undefined {
  return toDate(date)?.toISOString();
}

export function formatDate(date: Date | string, locale = "fr-FR"): string {
  const value = toDate(date);
  if (!value) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
