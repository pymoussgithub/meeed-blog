-- Remove the retired Domain business entity and its article/document links.
DROP INDEX IF EXISTS "Article_domainId_idx";
DROP INDEX IF EXISTS "Document_domainId_idx";
ALTER TABLE "Article" DROP CONSTRAINT IF EXISTS "Article_domainId_fkey";
ALTER TABLE "Document" DROP CONSTRAINT IF EXISTS "Document_domainId_fkey";
ALTER TABLE "Article" DROP COLUMN IF EXISTS "domainId";
ALTER TABLE "Document" DROP COLUMN IF EXISTS "domainId";
DROP TABLE IF EXISTS "Domain";
