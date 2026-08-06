-- AlterTable
ALTER TABLE "Document" ADD COLUMN "categoryId" TEXT;

-- CreateIndex
CREATE INDEX "Document_categoryId_idx" ON "Document"("categoryId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
