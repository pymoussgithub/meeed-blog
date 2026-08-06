"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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

export type FileUploadHandle = {
  /** Envoie le fichier sélectionné. Retourne true si l’upload a réussi. */
  upload: () => Promise<boolean>;
  /** Envoie un fichier fourni (ex. bibliothèque d’images libres). */
  uploadFile: (file: File) => Promise<boolean>;
  clear: () => void;
  getSelectedFile: () => File | null;
};

type FileUploadProps = {
  accept: string;
  maxBytes: number;
  allowedMimeTypes: readonly string[];
  signatureEndpoint: string;
  getSignatureBody: (file: File) => Record<string, unknown>;
  prepareFile?: (file: File) => Promise<File | null>;
  resourceLabel?: string;
  onUploaded: (result: CloudinaryUploadResult, file: File) => void;
  onError?: (message: string) => void;
  /** Si false, la sélection ne fait que préparer le fichier (upload via ref). Défaut true. */
  autoUpload?: boolean;
  onFileSelected?: (file: File | null) => void;
  className?: string;
};

export const FileUpload = forwardRef<FileUploadHandle, FileUploadProps>(
  function FileUpload(
    {
      accept,
      maxBytes,
      allowedMimeTypes,
      signatureEndpoint,
      getSignatureBody,
      prepareFile,
      resourceLabel = "fichier",
      onUploaded,
      onError,
      autoUpload = true,
      onFileSelected,
      className,
    },
    ref,
  ) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [lastFileName, setLastFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selectedFileRef = useRef<File | null>(null);

    const reportError = useCallback(
      (message: string) => {
        onError?.(message);
      },
      [onError],
    );

    const setFile = useCallback(
      (file: File | null) => {
        selectedFileRef.current = file;
        setSelectedFile(file);
        onFileSelected?.(file);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      },
      [onFileSelected],
    );

    const validateFile = useCallback(
      (file: File) => {
        if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
          reportError(`Format non supporté. Types acceptés : ${allowedMimeTypes.join(", ")}`);
          return false;
        }

        if (file.size > maxBytes) {
          reportError(`Fichier trop volumineux (max ${Math.round(maxBytes / (1024 * 1024))} Mo).`);
          return false;
        }

        return true;
      },
      [allowedMimeTypes, maxBytes, reportError],
    );

    const uploadFile = useCallback(
      async (file: File) => {
        if (!validateFile(file)) {
          return false;
        }

        const fileToUpload = prepareFile ? await prepareFile(file) : file;
        if (!fileToUpload) {
          return false;
        }

        if (!validateFile(fileToUpload)) {
          return false;
        }

        setIsUploading(true);
        setProgress(10);
        setLastFileName(fileToUpload.name);

        try {
          const signatureResponse = await fetch(signatureEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(getSignatureBody(fileToUpload)),
          });

          if (!signatureResponse.ok) {
            const error = await signatureResponse.json().catch(() => ({}));
            throw new Error(error.error ?? "Impossible d'obtenir la signature d'upload.");
          }

          const signatureData: UploadSignatureResponse = await signatureResponse.json();
          setProgress(35);

          const formData = new FormData();
          formData.append("file", fileToUpload);
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
          onUploaded(result, fileToUpload);
          setFile(null);
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erreur d'upload.";
          reportError(message);
          return false;
        } finally {
          setIsUploading(false);
          setTimeout(() => setProgress(0), 800);
        }
      },
      [
        getSignatureBody,
        onUploaded,
        prepareFile,
        reportError,
        setFile,
        signatureEndpoint,
        validateFile,
      ],
    );

    useImperativeHandle(
      ref,
      () => ({
        upload: async () => {
          const file = selectedFileRef.current;
          if (!file) {
            reportError(`Sélectionnez un ${resourceLabel} avant de valider.`);
            return false;
          }
          return uploadFile(file);
        },
        uploadFile: (file: File) => uploadFile(file),
        clear: () => setFile(null),
        getSelectedFile: () => selectedFileRef.current,
      }),
      [reportError, resourceLabel, setFile, uploadFile],
    );

    const handleFiles = useCallback(
      async (files: FileList | null) => {
        const file = files?.[0];
        if (!file) {
          return;
        }

        if (!validateFile(file)) {
          return;
        }

        if (autoUpload) {
          await uploadFile(file);
          return;
        }

        setFile(file);
        setLastFileName(file.name);
      },
      [autoUpload, setFile, uploadFile, validateFile],
    );

    return (
      <div className={cn("w-full", className)}>
        <label
          className={cn(
            "flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
            isDragging ? "border-accent bg-bg-soft" : "border-gray-300 hover:border-accent",
            isUploading && "pointer-events-none opacity-70",
            !autoUpload && selectedFile && "border-accent/40 bg-bg-soft/50",
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={isUploading}
            onChange={(event) => void handleFiles(event.target.files)}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm text-primary/70">Envoi vers Cloudinary…</p>
            </div>
          ) : !autoUpload && selectedFile ? (
            <>
              <p className="text-sm font-medium text-primary-dark">{selectedFile.name}</p>
              <p className="mt-1 text-xs text-primary/60">
                {(selectedFile.size / 1024).toFixed(1)} Ko — cliquez pour changer de fichier
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-primary-dark">
                Glissez un {resourceLabel} ici ou cliquez pour parcourir
              </p>
              <p className="mt-2 text-xs text-primary/50">
                Max {Math.round(maxBytes / (1024 * 1024))} Mo
                {!autoUpload ? " — l’envoi se fait après validation" : ""}
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

        {autoUpload && lastFileName ? (
          <p className="mt-2 text-xs text-primary/50">Dernier fichier : {lastFileName}</p>
        ) : null}
      </div>
    );
  },
);
