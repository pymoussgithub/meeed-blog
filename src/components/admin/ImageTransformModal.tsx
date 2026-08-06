"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export type ImageTransformConfig = {
  aspectRatio: number;
  targetWidth: number;
  targetHeight: number;
  title: string;
  description: string;
  outputMimeType?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
};

type ImageTransformRequest = {
  file: File;
  config: ImageTransformConfig;
};

type ImageMetrics = {
  width: number;
  height: number;
};

type TransformPreview = {
  backgroundSizeX: number;
  backgroundSizeY: number;
  backgroundPositionX: number;
  backgroundPositionY: number;
};

const PREVIEW_WIDTH_UNITS = 100;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Place the image inside a fixed frame using "contain" as the base scale.
 * Zoom 1 = entire image visible (white bars if aspect differs or image is small).
 * Zoom > 1 = enlarge within the frame (can fill / crop).
 */
function getPreviewMetrics(
  image: ImageMetrics,
  aspectRatio: number,
  zoom: number,
  offsetX: number,
  offsetY: number,
): TransformPreview {
  const previewHeightUnits = PREVIEW_WIDTH_UNITS / aspectRatio;
  const fitScale = Math.min(
    PREVIEW_WIDTH_UNITS / image.width,
    previewHeightUnits / image.height,
  );

  const renderedWidth = image.width * fitScale * zoom;
  const renderedHeight = image.height * fitScale * zoom;

  return {
    backgroundSizeX: (renderedWidth / PREVIEW_WIDTH_UNITS) * 100,
    backgroundSizeY: (renderedHeight / previewHeightUnits) * 100,
    backgroundPositionX: (offsetX + 100) / 2,
    backgroundPositionY: (offsetY + 100) / 2,
  };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Impossible de charger l'image."));
    image.src = url;
  });
}

async function renderTransformedFile(
  file: File,
  config: ImageTransformConfig,
  zoom: number,
  offsetX: number,
  offsetY: number,
) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(sourceUrl);
    const canvas = document.createElement("canvas");
    canvas.width = config.targetWidth;
    canvas.height = config.targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Le navigateur ne permet pas de préparer l'image.");
    }

    // White 16:9 (or configured) frame behind the image
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, config.targetWidth, config.targetHeight);

    const fitScale = Math.min(
      config.targetWidth / image.naturalWidth,
      config.targetHeight / image.naturalHeight,
    );

    const drawWidth = image.naturalWidth * fitScale * zoom;
    const drawHeight = image.naturalHeight * fitScale * zoom;

    // Matches CSS background-position % for both letterbox and overflow cases
    const destX = ((config.targetWidth - drawWidth) * (offsetX + 100)) / 200;
    const destY = ((config.targetHeight - drawHeight) * (offsetY + 100)) / 200;

    ctx.drawImage(image, destX, destY, drawWidth, drawHeight);

    const mimeType = config.outputMimeType ?? "image/jpeg";
    const quality = config.quality ?? 0.92;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mimeType, quality),
    );

    if (!blob) {
      throw new Error("Impossible de générer l'image préparée.");
    }

    const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");

    return new File([blob], `${baseName}-${config.targetWidth}x${config.targetHeight}.${extension}`, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function useImageTransform() {
  const resolverRef = useRef<((file: File | null) => void) | null>(null);
  const [request, setRequest] = useState<ImageTransformRequest | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [image, setImage] = useState<ImageMetrics | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!request) return;

    const url = URL.createObjectURL(request.file);
    setPreviewUrl(url);

    loadImage(url)
      .then((loadedImage) => {
        setImage({ width: loadedImage.naturalWidth, height: loadedImage.naturalHeight });
      })
      .catch(() => {
        setImage(null);
      });

    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
      setImage(null);
      setZoom(MIN_ZOOM);
      setOffsetX(0);
      setOffsetY(0);
      setIsConfirming(false);
    };
  }, [request]);

  const openEditor = useCallback((file: File, config: ImageTransformConfig) => {
    return new Promise<File | null>((resolve) => {
      resolverRef.current = resolve;
      setRequest({ file, config });
    });
  }, []);

  const closeEditor = useCallback((value: File | null) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!request) return;

    setIsConfirming(true);
    try {
      const transformedFile = await renderTransformedFile(
        request.file,
        request.config,
        zoom,
        offsetX,
        offsetY,
      );
      closeEditor(transformedFile);
    } catch {
      closeEditor(null);
    }
  }, [closeEditor, offsetX, offsetY, request, zoom]);

  const previewMetrics = useMemo(() => {
    if (!image || !request) return null;
    return getPreviewMetrics(image, request.config.aspectRatio, zoom, offsetX, offsetY);
  }, [image, offsetX, offsetY, request, zoom]);

  const modal = request ? (
    <Modal
      open={Boolean(request)}
      onClose={() => closeEditor(null)}
      className="max-h-[min(92dvh,56rem)] max-w-5xl overflow-hidden rounded-2xl p-0"
    >
      <div className="flex max-h-[min(92dvh,56rem)] flex-col">
        <div className="shrink-0 space-y-2 border-b border-primary/10 px-5 pb-4 pt-5 sm:px-6">
          <h2 id="modal-title" className="pr-14 text-lg font-bold text-primary-dark">
            {request.config.title}
          </h2>
          <p className="text-sm text-primary/65">{request.config.description}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]">
                <div
                  className="relative w-full bg-white bg-center bg-no-repeat"
                  style={{
                    aspectRatio: `${request.config.aspectRatio}`,
                    backgroundImage: previewUrl ? `url("${previewUrl}")` : undefined,
                    backgroundSize: previewMetrics
                      ? `${previewMetrics.backgroundSizeX}% ${previewMetrics.backgroundSizeY}%`
                      : undefined,
                    backgroundPosition: previewMetrics
                      ? `${previewMetrics.backgroundPositionX}% ${previewMetrics.backgroundPositionY}%`
                      : undefined,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-primary/55">
                {image ? <span>Source: {image.width} x {image.height}px</span> : null}
                <span>
                  Export: {request.config.targetWidth} x {request.config.targetHeight}px (cadre blanc)
                </span>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-primary/10 bg-bg-soft/50 p-4">
              <label className="block text-sm font-medium text-primary-dark">
                Zoom
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.01}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="mt-2 w-full"
                />
                <span className="mt-1 block text-xs text-primary/55">
                  {zoom.toFixed(2)}x — agrandissez si l&apos;image est trop petite dans le cadre
                </span>
              </label>

              <label className="block text-sm font-medium text-primary-dark">
                Décalage horizontal
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={offsetX}
                  onChange={(event) => setOffsetX(clamp(Number(event.target.value), -100, 100))}
                  className="mt-2 w-full"
                />
                <span className="mt-1 block text-xs text-primary/55">
                  {offsetX > 0 ? `+${offsetX}` : offsetX}
                </span>
              </label>

              <label className="block text-sm font-medium text-primary-dark">
                Décalage vertical
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={1}
                  value={offsetY}
                  onChange={(event) => setOffsetY(clamp(Number(event.target.value), -100, 100))}
                  className="mt-2 w-full"
                />
                <span className="mt-1 block text-xs text-primary/55">
                  {offsetY > 0 ? `+${offsetY}` : offsetY}
                </span>
              </label>

              <Button
                type="button"
                variant="ghost"
                className="!px-0 text-sm"
                onClick={() => {
                  setZoom(MIN_ZOOM);
                  setOffsetX(0);
                  setOffsetY(0);
                }}
              >
                Revenir au cadrage automatique
              </Button>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-primary/10 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => closeEditor(null)}
              disabled={isConfirming}
            >
              Annuler
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!image || isConfirming}>
              {isConfirming ? "Préparation…" : "Utiliser cette version"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  ) : null;

  return { openEditor, modal };
}
