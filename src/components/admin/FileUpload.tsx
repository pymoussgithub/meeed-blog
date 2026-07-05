"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export type UploadSignatureResponse = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId?: string;
  uploadUrl: string;
  limits: {
    maxBytes: number;
    mimeTypes: readonly string[];
  };
};

export type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  bytes: number;
  format?: string;
  width?: number;
  height?: number;
  original_filename?: string;
};

type FileUploadProps = {
  accept: string;
  maxBytes: number;
  allowedMimeTypes: readonly string[];
  signatureEndpoint: string;
  getSignatureBody: (file: File) => Record<string, unknown>;
  resourceLabel?: string;
  onUploaded: (result: CloudinaryUploadResult) => void;
  onError?: (message: string) => void;
  className?: string;
};

export function FileUpload({
  accept,
  maxBytes,
  allowedMimeTypes,
  signatureEndpoint,
  getSignatureBody,
  resourceLabel = "fichier",
  onUploaded,
  onError,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastFileName, setLastFileName] = useState<string | null>(null);

  const reportError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (!allowedMimeTypes.includes(file.type)) {
        reportError(`Format non supporté. Types acceptés : ${allowedMimeTypes.join(", ")}`);
        return;
      }

      if (file.size > maxBytes) {
        reportError(`Fichier trop volumineux (max ${Math.round(maxBytes / (1024 * 1024))} Mo).`);
        return;
      }

      setIsUploading(true);
      setProgress(10);
      setLastFileName(file.name);

      try {
        const signatureResponse = await fetch(signatureEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getSignatureBody(file)),
        });

        if (!signatureResponse.ok) {
          const error = await signatureResponse.json().catch(() => ({}));
          throw new Error(error.error ?? "Impossible d'obtenir la signature d'upload.");
        }

        const signatureData: UploadSignatureResponse = await signatureResponse.json();
        setProgress(35);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", String(signatureData.timestamp));
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);
        if (signatureData.publicId) {
          formData.append("public_id", signatureData.publicId);
        }

        setProgress(55);

        const uploadResponse = await fetch(signatureData.uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(errorText || "Échec de l'upload Cloudinary.");
        }

        const result: CloudinaryUploadResult = await uploadResponse.json();
        setProgress(100);
        onUploaded(result);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur d'upload.";
        reportError(message);
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 800);
      }
    },
    [
      allowedMimeTypes,
      maxBytes,
      onUploaded,
      reportError,
      getSignatureBody,
      signatureEndpoint,
    ],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile],
  );

  return (
    <div className={cn("w-full", className)}>
      <label
        className={cn(
          "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          isDragging ? "border-accent bg-bg-soft" : "border-gray-300 hover:border-accent",
          isUploading && "pointer-events-none opacity-70",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={isUploading}
          onChange={(event) => handleFiles(event.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Spinner />
            <p className="text-sm text-primary/70">Envoi vers Cloudinary…</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-primary-dark">
              Glissez un {resourceLabel} ici ou cliquez pour parcourir
            </p>
            <p className="mt-2 text-xs text-primary/50">
              Max {Math.round(maxBytes / (1024 * 1024))} Mo
            </p>
          </>
        )}
      </label>

      {progress > 0 ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}

      {lastFileName ? (
        <p className="mt-2 text-xs text-primary/50">Dernier fichier : {lastFileName}</p>
      ) : null}
    </div>
  );
}
