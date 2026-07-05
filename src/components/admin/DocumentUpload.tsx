"use client";

import { useState } from "react";
import { FileUpload, type CloudinaryUploadResult } from "@/components/admin/FileUpload";
import { Toast } from "@/components/ui/Toast";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";
import { saveDocumentMetadata } from "@/lib/services/upload.service";

type DocumentUploadProps = {
  articleId?: string;
  onUploaded?: (metadata: ReturnType<typeof saveDocumentMetadata>) => void;
};

export function DocumentUpload({ articleId, onUploaded }: DocumentUploadProps) {
  const [lastUpload, setLastUpload] = useState<ReturnType<typeof saveDocumentMetadata> | null>(
    null,
  );
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  const handleUploaded = async (result: CloudinaryUploadResult) => {
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
      result.original_filename ?? "document.pdf",
      result.bytes,
      articleId,
    );

    setLastUpload(metadata);
    setToast({ message: "PDF uploadé avec succès.", variant: "success" });
    onUploaded?.(metadata);
  };

  return (
    <div>
      <FileUpload
        accept="application/pdf"
        maxBytes={UPLOAD_LIMITS.documentMaxBytes}
        allowedMimeTypes={UPLOAD_LIMITS.documentMimeTypes}
        signatureEndpoint="/api/upload/document"
        getSignatureBody={(file) => ({
          articleId,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        })}
        resourceLabel="PDF"
        onUploaded={handleUploaded}
        onError={(message) => setToast({ message, variant: "error" })}
      />

      {lastUpload ? (
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
