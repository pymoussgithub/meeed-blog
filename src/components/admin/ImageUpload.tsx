"use client";

import Image from "next/image";
import { useState } from "react";
import {
  FileUpload,
  type CloudinaryUploadResult,
} from "@/components/admin/FileUpload";
import {
  useImageTransform,
  type ImageTransformConfig,
} from "@/components/admin/ImageTransformModal";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { deleteUploadedImageAction } from "@/actions/upload.actions";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";
import { saveImageMetadata } from "@/lib/services/upload.service";

type ImageUploadProps = {
  purpose?: "cover" | "inline" | "project-cover";
  articleId?: string;
  projectId?: string;
  initialUrl?: string | null;
  initialPublicId?: string | null;
  onUploaded?: (metadata: ReturnType<typeof saveImageMetadata>) => void;
  onRemoved?: () => void;
  className?: string;
  hint?: string;
};

const TRANSFORM_CONFIGS: Record<NonNullable<ImageUploadProps["purpose"]>, ImageTransformConfig> = {
  cover: {
    aspectRatio: 16 / 9,
    targetWidth: 1600,
    targetHeight: 900,
    title: "Ajuster l'image de couverture",
    description:
      "Cadrez l'image telle qu'elle apparaîtra sur la couverture de l'article, puis envoyez la version préparée.",
  },
  "project-cover": {
    aspectRatio: 16 / 10,
    targetWidth: 1600,
    targetHeight: 1000,
    title: "Ajuster l'image du projet",
    description:
      "Positionnez l'image dans le format d'affichage du projet pour obtenir un rendu propre sur les cartes et la page Projets.",
  },
  inline: {
    aspectRatio: 16 / 9,
    targetWidth: 1600,
    targetHeight: 900,
    title: "Ajuster l'image",
    description: "Préparez l'image avec un cadrage simple avant son envoi.",
  },
};

export function ImageUpload({
  purpose = "cover",
  articleId,
  projectId,
  initialUrl,
  initialPublicId,
  onUploaded,
  onRemoved,
  className,
  hint,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl ?? null);
  const [publicId, setPublicId] = useState<string | null>(initialPublicId ?? null);
  const [sessionPublicId, setSessionPublicId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );
  const { openEditor, modal } = useImageTransform();

  const deleteSessionUpload = async (targetPublicId: string) => {
    const result = await deleteUploadedImageAction(targetPublicId);
    if (!result.success) {
      throw new Error(result.error);
    }
  };

  const handleUploaded = async (result: CloudinaryUploadResult) => {
    if (sessionPublicId && sessionPublicId !== result.public_id) {
      try {
        await deleteSessionUpload(sessionPublicId);
      } catch {
        // L'ancienne image restera orpheline sur Cloudinary, sans bloquer le remplacement.
      }
    }

    const metadata = saveImageMetadata(result.public_id, result.secure_url, {
      articleId,
      projectId,
      purpose,
    });

    setPreviewUrl(result.secure_url);
    setPublicId(result.public_id);
    setSessionPublicId(result.public_id);
    setToast({ message: "Image uploadée avec succès.", variant: "success" });
    onUploaded?.(metadata);
  };

  const handleRemove = async () => {
    setIsRemoving(true);

    try {
      if (sessionPublicId) {
        await deleteSessionUpload(sessionPublicId);
      }

      setPreviewUrl(null);
      setPublicId(null);
      setSessionPublicId(null);
      setToast({ message: "Image supprimée.", variant: "success" });
      onRemoved?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de supprimer l'image.";
      setToast({ message, variant: "error" });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={className}>
      <FileUpload
        accept={UPLOAD_LIMITS.imageMimeTypes.join(",")}
        maxBytes={UPLOAD_LIMITS.imageMaxBytes}
        allowedMimeTypes={UPLOAD_LIMITS.imageMimeTypes}
        signatureEndpoint="/api/upload/image"
        getSignatureBody={() => ({ purpose, articleId, projectId })}
        prepareFile={(file) => openEditor(file, TRANSFORM_CONFIGS[purpose])}
        resourceLabel="image"
        onUploaded={handleUploaded}
        onError={(message) => setToast({ message, variant: "error" })}
      />

      <p className="mt-2 text-xs text-primary/50">
        {hint ??
          "Format recommandé pour la couverture : 16:9 (ex. 1200×675 px) — idéal pour le partage WhatsApp."}
      </p>

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="relative aspect-video w-full bg-gray-50">
            <Image
              src={previewUrl}
              alt="Aperçu upload"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
            <div className="absolute right-3 top-3">
              <Button
                type="button"
                variant="primary"
                className="!rounded-lg !bg-black/70 !px-3 !py-1.5 !text-xs hover:!bg-black/85"
                onClick={handleRemove}
                disabled={isRemoving}
              >
                {isRemoving ? "Suppression…" : "Supprimer"}
              </Button>
            </div>
          </div>
          {publicId && !sessionPublicId ? (
            <p className="border-t border-gray-100 px-3 py-2 text-xs text-primary/50">
              Image enregistrée — remplacez-la ou supprimez-la avant d&apos;enregistrer.
            </p>
          ) : null}
        </div>
      ) : null}

      <Toast
        message={toast?.message ?? ""}
        visible={Boolean(toast)}
        variant={toast?.variant ?? "success"}
        onClose={() => setToast(null)}
      />
      {modal}
    </div>
  );
}
