-- CreateEnum
CREATE TYPE "DocumentVisibility" AS ENUM ('PUBLIC', 'CONTRIBUTOR', 'ADMIN');

-- AlterTable
ALTER TABLE "Document"
ADD COLUMN "visibility" "DocumentVisibility" NOT NULL DEFAULT 'PUBLIC';

-- MigrateData
UPDATE "Document"
SET "visibility" = CASE
  WHEN "isPublic" = TRUE THEN 'PUBLIC'::"DocumentVisibility"
  ELSE 'ADMIN'::"DocumentVisibility"
END;

-- AlterTable
ALTER TABLE "Document"
DROP COLUMN "isPublic";

-- CreateIndex
CREATE INDEX "Document_visibility_idx" ON "Document"("visibility");
