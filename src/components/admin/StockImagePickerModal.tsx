"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import {
  STOCK_IMAGE_SUGGESTIONS,
  type StockImage,
  type StockImageSearchResult,
} from "@/lib/stock-images-shared";
import { cn } from "@/lib/utils";

type StockImagePickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (file: File) => void;
  initialQuery?: string;
};

export function StockImagePickerModal({
  open,
  onClose,
  onSelect,
  initialQuery = "éducation",
}: StockImagePickerModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<StockImageSearchResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<StockImage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (nextQuery: string, nextPage: number) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      setError("Saisissez un mot-clé pour rechercher.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedImage(null);

    try {
      const params = new URLSearchParams({
        q: trimmed,
        page: String(nextPage),
      });
      const response = await fetch(`/api/stock-images?${params.toString()}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Recherche impossible.",
        );
      }

      setQuery(trimmed);
      setPage(nextPage);
      setResult(data as StockImageSearchResult);
    } catch (searchError) {
      setResult(null);
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Impossible de charger la bibliothèque.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraftQuery(initialQuery);
    setQuery(initialQuery);
    setPage(1);
    setResult(null);
    setSelectedImage(null);
    setError(null);
    setIsImporting(false);
    void search(initialQuery, 1);
  }, [initialQuery, open, search]);

  const handleConfirm = async () => {
    if (!selectedImage || isImporting) return;

    setIsImporting(true);
    setError(null);

    try {
      const response = await fetch("/api/stock-images/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: selectedImage.fullUrl }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "Téléchargement impossible.",
        );
      }

      const blob = await response.blob();
      const contentType = blob.type || "image/jpeg";
      const extension =
        contentType === "image/png"
          ? "png"
          : contentType === "image/webp"
            ? "webp"
            : "jpg";
      const safeTitle = selectedImage.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 48);

      const file = new File([blob], `${safeTitle || "stock-cover"}.${extension}`, {
        type: contentType,
        lastModified: Date.now(),
      });

      onSelect(file);
      onClose();
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Impossible d'importer cette image.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-h-[min(92dvh,52rem)] max-w-4xl overflow-hidden rounded-2xl p-0"
    >
      <div className="flex max-h-[min(92dvh,52rem)] flex-col">
        <div className="shrink-0 space-y-2 border-b border-primary/10 px-5 pb-4 pt-5 sm:px-6">
          <h2 id="modal-title" className="pr-14 text-lg font-bold text-primary-dark">
            Bibliothèque d&apos;images libres
          </h2>
          <p className="text-sm text-primary/65">
            Photos libres via Pexels. Sélectionnez une image, validez, puis ajustez le cadrage
            comme pour un upload.
          </p>
        </div>

        <div className="shrink-0 space-y-3 border-b border-primary/5 px-5 py-4 sm:px-6">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void search(draftQuery, 1);
            }}
          >
            <input
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Rechercher (ex. école, nature, communauté…)"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-primary-dark placeholder:text-primary/35 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              autoFocus
            />
            <Button type="submit" disabled={isLoading || !draftQuery.trim()}>
              Rechercher
            </Button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {STOCK_IMAGE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setDraftQuery(suggestion);
                  void search(suggestion, 1);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  query === suggestion
                    ? "border-accent bg-accent/10 text-accent-dark"
                    : "border-gray-200 text-primary/60 hover:border-accent/40 hover:text-primary-dark",
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {error ? (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading && !result ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3">
              <Spinner />
              <p className="text-sm text-primary/60">Chargement des images…</p>
            </div>
          ) : null}

          {!isLoading && result && result.results.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-primary-dark">Aucun résultat</p>
              <p className="mt-1 text-xs text-primary/55">
                Essayez un autre mot-clé ou une suggestion ci-dessus.
              </p>
            </div>
          ) : null}

          {result && result.results.length > 0 ? (
            <div
              className={cn(
                "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
                isLoading && "opacity-60",
              )}
            >
              {result.results.map((image) => {
                const selected = selectedImage?.id === image.id;
                const importing = isImporting && selected;
                return (
                  <button
                    key={image.id}
                    type="button"
                    disabled={isImporting}
                    onClick={() => setSelectedImage(image)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border bg-bg-soft text-left transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      selected
                        ? "border-accent ring-2 ring-accent"
                        : "border-gray-200",
                    )}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.thumbnailUrl}
                        alt={image.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      {importing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <Spinner size="sm" />
                        </div>
                      ) : null}
                    </div>
                    <div className="space-y-0.5 p-2">
                      <p className="line-clamp-1 text-xs font-medium text-primary-dark">
                        {image.title}
                      </p>
                      <p className="line-clamp-1 text-[10px] text-primary/50">
                        {image.creator ? `${image.creator} · ` : ""}
                        {image.license}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-primary/10 px-5 py-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-3">
            <p className="text-xs text-primary/50 sm:justify-self-start">
              {result
                ? `${result.resultCount.toLocaleString("fr-FR")} image${result.resultCount > 1 ? "s" : ""} · page ${result.page}/${Math.max(result.pageCount, 1)}`
                : "Source : Pexels"}
            </p>

            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || page <= 1 || isImporting}
                onClick={() => void search(query, page - 1)}
              >
                Précédent
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={
                  isLoading ||
                  isImporting ||
                  !result ||
                  page >= result.pageCount
                }
                onClick={() => void search(query, page + 1)}
              >
                Suivant
              </Button>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isImporting}>
                Annuler
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirm()}
                disabled={!selectedImage || isImporting}
              >
                {isImporting ? "Import…" : "Choisir cette image"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
