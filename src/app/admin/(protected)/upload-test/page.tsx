import { DocumentUpload } from "@/components/admin/DocumentUpload";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function AdminUploadTestPage() {
  return (
    <div className="container-meeed py-10">
      <h1 className="text-2xl font-bold">Test upload Cloudinary</h1>
      <p className="mt-2 max-w-2xl text-primary/70">
        Les fichiers sont envoyés sur Cloudinary via upload signé. Connexion requise (Phase 4).
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold">Image de couverture</h2>
          <p className="mt-1 text-sm text-primary/60">JPG, PNG, WebP ou GIF — max 10 Mo</p>
          <div className="mt-4">
            <ImageUpload purpose="cover" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Document PDF</h2>
          <p className="mt-1 text-sm text-primary/60">PDF uniquement — max 25 Mo</p>
          <div className="mt-4">
            <DocumentUpload />
          </div>
        </section>
      </div>
    </div>
  );
}
