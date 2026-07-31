"use client";

import { useRef, useState } from "react";
import {
  FileUpload,
  type CloudinaryUploadResult,
  type FileUploadHandle,
} from "@/components/admin/FileUpload";
import { Toast } from "@/components/ui/Toast";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";
import { saveDocumentMetadata } from "@/lib/services/upload.service";

type DocumentUploadProps = {
  articleId?: string;
  onUploaded?: (metadata: ReturnType<typeof saveDocumentMetadata>) => void | Promise<void>;
  /**
   * Si true : la sélection ne fait qu’enregistrer le fichier localement ;
   * l’upload Cloudinary part au clic sur le bouton de validation.
   */
  confirmBeforeUpload?: boolean;
  submitLabel?: string;
  /** Return a message to block the upload, or true to proceed. */
  validateBeforeUpload?: () => true | string;
};

export function DocumentUpload({
  articleId,
  onUploaded,
  confirmBeforeUpload = false,
  submitLabel = "Enregistrer le document",
  validateBeforeUpload,
}: DocumentUploadProps) {
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [hasFile, setHasFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpload, setLastUpload] = useState<ReturnType<typeof saveDocumentMetadata> | null>(
    null,
  );
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  const handleUploaded = async (result: CloudinaryUploadResult, file: File) => {
    let url = result.secure_url;

    try {
      const previewResponse = await fetch("/api/documents/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: result.public_id }),
      });

      if (previewResponse.ok) {
        const previewData: { url: string } = await previewResponse.json();
        url = previewData.url;
      }
    } catch {
      // Fallback sur secure_url si la preview signée échoue
    }

    const metadata = saveDocumentMetadata(
      result.public_id,
      url,
      result.original_filename ?? file.name,
      result.bytes,
      file.type || "application/octet-stream",
      articleId,
    );

    setLastUpload(metadata);
    setHasFile(false);
    await onUploaded?.(metadata);
  };

  const handleConfirm = async () => {
    if (validateBeforeUpload) {
      const validation = validateBeforeUpload();
      if (validation !== true) {
        setToast({ message: validation, variant: "error" });
        return;
      }
    }

    if (!hasFile) {
      setToast({ message: "Sélectionnez un fichier avant de valider.", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await fileUploadRef.current?.upload();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <FileUpload
        ref={fileUploadRef}
        accept="*/*"
        maxBytes={UPLOAD_LIMITS.documentMaxBytes}
        allowedMimeTypes={UPLOAD_LIMITS.documentMimeTypes}
        signatureEndpoint="/api/upload/document"
        autoUpload={!confirmBeforeUpload}
        onFileSelected={(file) => setHasFile(Boolean(file))}
        getSignatureBody={(file) => ({
          articleId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })}
        resourceLabel="fichier"
        prepareFile={
          confirmBeforeUpload
            ? undefined
            : async (file) => {
                if (!validateBeforeUpload) {
                  return file;
                }
                const validation = validateBeforeUpload();
                if (validation !== true) {
                  setToast({ message: validation, variant: "error" });
                  return null;
                }
                return file;
              }
        }
        onUploaded={(result, file) => {
          void handleUploaded(result, file);
        }}
        onError={(message) => setToast({ message, variant: "error" })}
      />

      {confirmBeforeUpload ? (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleConfirm()}
          className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement…" : submitLabel}
        </button>
      ) : null}

      {!confirmBeforeUpload && lastUpload ? (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <p className="font-medium text-primary-dark">{lastUpload.fileName}</p>
          <p className="mt-1 text-primary/60">
            {(lastUpload.fileSize / 1024).toFixed(1)} Ko —{" "}
            <a
              href={lastUpload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-dark hover:underline"
            >
              Ouvrir le fichier
            </a>
          </p>
        </div>
      ) : null}

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
