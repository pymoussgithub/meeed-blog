"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { LinkInsertModal, type LinkInsertValues } from "@/components/admin/LinkInsertModal";
import { useOptionalDialog } from "@/components/ui/DialogProvider";
import { countEditorWords } from "@/lib/editor-utils";
import { cn } from "@/lib/utils";
import {
  buildInlineDocumentViewPath,
  getFileExtension,
} from "@/lib/inline-document";
import { UPLOAD_LIMITS } from "@/lib/upload-constants";

type TipTapEditorProps = {
  content: string;
  onChange: (html: string) => void;
  articleId?: string;
  className?: string;
  placeholder?: string;
};

async function uploadInlineImage(file: File, articleId?: string) {
  if (!(UPLOAD_LIMITS.imageMimeTypes as readonly string[]).includes(file.type)) {
    throw new Error("Format d'image non supporté");
  }

  if (file.size > UPLOAD_LIMITS.imageMaxBytes) {
    throw new Error("Image trop volumineuse");
  }

  const signatureResponse = await fetch("/api/upload/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ purpose: "inline", articleId }),
  });

  if (!signatureResponse.ok) {
    throw new Error("Impossible d'obtenir la signature d'upload");
  }

  const signatureData = await signatureResponse.json();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signatureData.apiKey);
  formData.append("timestamp", String(signatureData.timestamp));
  formData.append("signature", signatureData.signature);
  formData.append("folder", signatureData.folder);

  const uploadResponse = await fetch(signatureData.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error("Échec de l'upload de l'image");
  }

  const result = await uploadResponse.json();
  return result.secure_url as string;
}

async function uploadInlineDocument(file: File, articleId?: string) {
  if (
    UPLOAD_LIMITS.documentMimeTypes.length > 0 &&
    !(UPLOAD_LIMITS.documentMimeTypes as readonly string[]).includes(file.type)
  ) {
    throw new Error("Format de document non supporté");
  }

  if (file.size > UPLOAD_LIMITS.documentMaxBytes) {
    throw new Error("Document trop volumineux");
  }

  const signatureResponse = await fetch("/api/upload/document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      articleId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }),
  });

  if (!signatureResponse.ok) {
    throw new Error("Impossible d'obtenir la signature d'upload du document");
  }

  const signatureData = await signatureResponse.json();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signatureData.apiKey);
  formData.append("timestamp", String(signatureData.timestamp));
  formData.append("signature", signatureData.signature);
  formData.append("folder", signatureData.folder);
  if (signatureData.publicId) {
    formData.append("public_id", signatureData.publicId);
  }

  const uploadResponse = await fetch(signatureData.uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error("Echec de l'upload du document");
  }

  const result = await uploadResponse.json();
  const publicId = typeof result.public_id === "string" ? result.public_id : "";
  if (!publicId) {
    throw new Error("Identifiant Cloudinary manquant apres l'upload");
  }

  return {
    fileName: file.name,
    url: buildInlineDocumentViewPath(publicId, getFileExtension(file.name)),
  };
}

function ToolbarDivider() {
  return <span className="mx-0.5 hidden h-6 w-px bg-gray-200 sm:block" aria-hidden />;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
  "data-tour-id": dataTourId,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  "data-tour-id"?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      data-tour-id={dataTourId}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors disabled:opacity-40",
        active
          ? "bg-accent text-white shadow-sm"
          : "text-primary/70 hover:bg-white hover:text-primary-dark hover:shadow-sm",
      )}
    >
      {children}
    </button>
  );
}

function normalizeLinkHref(url: string) {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function applyLinkValues(editor: Editor, { text, url }: LinkInsertValues) {
  if (!url.trim()) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  const href = normalizeLinkHref(url);

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .deleteSelection()
    .insertContent({
      type: "text",
      text,
      marks: [{ type: "link", attrs: { href } }],
    })
    .run();
}

function EditorToolbar({
  editor,
  onAddImage,
  onAddDocument,
  isUploading,
}: {
  editor: Editor;
  onAddImage: () => void;
  onAddDocument: () => void;
  isUploading: boolean;
}) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState("");
  const [linkInitialUrl, setLinkInitialUrl] = useState("https://");

  const openLinkModal = useCallback(() => {
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").run();
    }

    const { from, to } = editor.state.selection;
    const displayText = from !== to ? editor.state.doc.textBetween(from, to, "") : "";
    const previousUrl = editor.getAttributes("link").href as string | undefined;

    setLinkInitialText(displayText);
    setLinkInitialUrl(previousUrl ?? "https://");
    setLinkModalOpen(true);
  }, [editor]);

  const handleLinkConfirm = useCallback(
    (values: LinkInsertValues) => {
      applyLinkValues(editor, values);
      setLinkModalOpen(false);
    },
    [editor],
  );

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-gray-200/80 bg-gray-50/90 px-1.5 py-1.5 backdrop-blur-sm">
      <ToolbarButton
        title="Annuler (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <IconUndo />
      </ToolbarButton>
      <ToolbarButton
        title="Rétablir (Ctrl+Y)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <IconRedo />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Titre section (H2)"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        data-tour-id="article.form.editor-h2"
      >
        <span className="text-xs font-bold">H2</span>
      </ToolbarButton>
      <ToolbarButton
        title="Sous-titre (H3)"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span className="text-xs font-bold">H3</span>
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Gras (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-tour-id="article.form.editor-bold"
      >
        <IconBold />
      </ToolbarButton>
      <ToolbarButton
        title="Italique (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic />
      </ToolbarButton>
      <ToolbarButton
        title="Barré"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <IconStrike />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Liste à puces"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        data-tour-id="article.form.editor-list"
      >
        <IconBulletList />
      </ToolbarButton>
      <ToolbarButton
        title="Liste numérotée"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconOrderedList />
      </ToolbarButton>
      <ToolbarButton
        title="Citation"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconQuote />
      </ToolbarButton>
      <ToolbarButton
        title="Séparateur"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <IconHr />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        title="Insérer un lien"
        active={editor.isActive("link")}
        onClick={openLinkModal}
        data-tour-id="article.form.editor-link"
      >
        <IconLink />
      </ToolbarButton>
      <ToolbarButton
        title="Insérer une image"
        disabled={isUploading}
        onClick={onAddImage}
        data-tour-id="article.form.editor-image"
      >
        {isUploading ? <IconSpinner /> : <IconImage />}
      </ToolbarButton>
      <ToolbarButton
        title="Joindre un PDF (insère un lien dans le texte)"
        disabled={isUploading}
        onClick={onAddDocument}
        data-tour-id="editor.toolbar.document"
      >
        {isUploading ? <IconSpinner /> : <IconDocument />}
      </ToolbarButton>

      <LinkInsertModal
        open={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={handleLinkConfirm}
        initialText={linkInitialText}
        initialUrl={linkInitialUrl}
      />
    </div>
  );
}

export function TipTapEditor({
  content,
  onChange,
  articleId,
  className,
  placeholder = "Commencez à rédiger votre article… Utilisez H2/H3 pour structurer, ou glissez-déposez une image.",
}: TipTapEditorProps) {
  const dialog = useOptionalDialog();
  const lastHtmlRef = useRef(content);
  const editorRef = useRef<Editor | null>(null);
  const [wordCount, setWordCount] = useState(() => countEditorWords(content));
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const insertImageFile = useCallback(
    async (editorInstance: Editor, file: File) => {
      setIsUploading(true);
      setUploadFeedback(null);
      try {
        const url = await uploadInlineImage(file, articleId);
        editorInstance.chain().focus().setImage({ src: url, alt: file.name }).run();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Impossible d'ajouter l'image.";
        if (dialog) {
          await dialog.alert(message, { variant: "error" });
        } else {
          window.alert(message);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [articleId, dialog],
  );

  const insertDocumentFile = useCallback(
    async (editorInstance: Editor, file: File) => {
      setIsUploading(true);
      setUploadFeedback(null);
      try {
        const { fileName, url } = await uploadInlineDocument(file, articleId);
        const { from, to } = editorInstance.state.selection;
        const selectedText = from !== to ? editorInstance.state.doc.textBetween(from, to, "") : "";

        editorInstance
          .chain()
          .focus()
          .extendMarkRange("link")
          .deleteSelection()
          .insertContent({
            type: "text",
            text: selectedText || fileName,
            marks: [{ type: "link", attrs: { href: url } }],
          })
          .run();

        try {
          await navigator.clipboard.writeText(url);
          setUploadFeedback("Lien du PDF copie dans le presse-papiers.");
        } catch {
          setUploadFeedback("PDF insere en lien dans le texte.");
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Impossible d'ajouter le document.";
        if (dialog) {
          await dialog.alert(message, { variant: "error" });
        } else {
          window.alert(message);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [articleId, dialog],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        horizontalRule: {},
        // StarterKit v3 embarque déjà Link — on le désactive pour garder
        // notre config (openOnClick, target, classes) sans doublon.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-accent-dark underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full h-auto my-4 shadow-sm",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      lastHtmlRef.current = html;
      setWordCount(countEditorWords(html));
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: "article-editor-content",
        spellcheck: "true",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved || !event.dataTransfer?.files?.length) return false;

        const file = event.dataTransfer.files[0];
        if (!file?.type.startsWith("image/")) return false;

        event.preventDefault();
        const ed = editorRef.current;
        if (!ed) return true;

        void insertImageFile(ed, file);
        setIsDragging(false);
        return true;
      },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((item) =>
          item.type.startsWith("image/"),
        );
        const ed = editorRef.current;
        if (!file || !ed) return false;

        event.preventDefault();
        void insertImageFile(ed, file);
        return true;
      },
    },
  });

  editorRef.current = editor ?? null;

  useEffect(() => {
    if (!editor) return;

    if (content !== lastHtmlRef.current && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
      lastHtmlRef.current = content;
      setWordCount(countEditorWords(content));
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = UPLOAD_LIMITS.imageMimeTypes.join(",");
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      void insertImageFile(editor, file);
    };
    input.click();
  }, [editor, insertImageFile]);

  const addDocument = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      UPLOAD_LIMITS.documentMimeTypes.length > 0 ? UPLOAD_LIMITS.documentMimeTypes.join(",") : "*/*";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      void insertDocumentFile(editor, file);
    };
    input.click();
  }, [editor, insertDocumentFile]);

  if (!editor) {
    return (
      <div className="min-h-[18rem] animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
    );
  }

  return (
    <div
      className={cn(
        "article-editor flex max-h-[min(70vh,42rem)] min-h-[22rem] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/15",
        className,
      )}
      onDragEnter={(event) => {
        if (event.dataTransfer.types.includes("Files")) setIsDragging(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) setIsDragging(false);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => setIsDragging(false)}
    >
      <EditorToolbar
        editor={editor}
        onAddImage={addImage}
        onAddDocument={addDocument}
        isUploading={isUploading}
      />

      <div className="article-editor-surface relative min-h-0 flex-1 overflow-y-auto bg-white">
        {isDragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-accent/10 backdrop-blur-[1px]">
            <p className="rounded-full bg-white px-4 py-2 text-sm font-medium text-accent-dark shadow-md">
              Déposez l&apos;image ici
            </p>
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/60 px-3 py-1.5 text-[11px] text-primary/50">
        <span>{wordCount} mot{wordCount > 1 ? "s" : ""}</span>
        <span className="text-accent-dark">{uploadFeedback ?? ""}</span>
        <span className="hidden sm:inline">
          Ctrl+B gras · Ctrl+I italique · Image : glisser/coller · PDF : icône document
        </span>
      </div>
    </div>
  );
}

function IconBold() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M8 11h4.5a2.5 2.5 0 0 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 0 0 0-5H8z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
    </svg>
  );
}

function IconStrike() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M10 16v2h4v-2h-4zm6-4.61A6.996 6.996 0 0 0 12 4c-3.31 0-6 2.1-6 5h2c0-1.38 1.19-3 4-3 1.66 0 3.14.59 4 1.39V9H8v2h8v-1.61z" />
    </svg>
  );
}

function IconBulletList() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
    </svg>
  );
}

function IconOrderedList() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M2 17h2v.5H1v1h3v-1.5H2V17zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
    </svg>
  );
}

function IconHr() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M4 11h16v2H4z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}

function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7zm0 2.5L16.5 7H14zM8 13h8v1.5H8zm0 3h8v1.5H8zm0-6h4v1.5H8z" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.63c1.39-1.16 3.16-1.87 5.12-1.87 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.71 5.12 1.87L13 16h9V7l-3.6 3.6z" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
