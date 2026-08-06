import { DocumentsManager } from "@/components/admin/DocumentsManager";
import { Button } from "@/components/ui/Button";
import { getAllDocuments } from "@/lib/services/document.service";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function AdminDocumentsPage() {
  const user = await getCurrentUser();
  const documents = await getAllDocuments(user?.id, user?.role === "ADMIN");

  return (
    <div className="container-meeed py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Documents</h1>
          <p className="mt-1 text-sm text-primary/60">
            {documents.length} document{documents.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          href="/admin/documents/nouveau"
          variant="accent"
          data-tour-id="admin.documents.new-button"
        >
          + Nouveau document
        </Button>
      </div>
      <div className="mt-8">
        <DocumentsManager documents={documents} />
      </div>
    </div>
  );
}
