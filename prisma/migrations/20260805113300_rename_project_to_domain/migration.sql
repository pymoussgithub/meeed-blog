-- Rename the Project business entity to Domain while preserving its data.
ALTER TABLE "Project" RENAME TO "Domain";
ALTER TABLE "Article" RENAME COLUMN "projectId" TO "domainId";
ALTER TABLE "Document" RENAME COLUMN "projectId" TO "domainId";

-- Rename primary, unique, foreign-key, and secondary indexes to match the new entity.
ALTER TABLE "Domain" RENAME CONSTRAINT "Project_pkey" TO "Domain_pkey";
ALTER INDEX "Project_slug_key" RENAME TO "Domain_slug_key";
ALTER TABLE "Domain" RENAME CONSTRAINT "Project_categoryId_fkey" TO "Domain_categoryId_fkey";
ALTER INDEX "Project_categoryId_idx" RENAME TO "Domain_categoryId_idx";
ALTER INDEX "Project_isActive_sortOrder_idx" RENAME TO "Domain_isActive_sortOrder_idx";
ALTER TABLE "Article" RENAME CONSTRAINT "Article_projectId_fkey" TO "Article_domainId_fkey";
ALTER INDEX "Article_projectId_idx" RENAME TO "Article_domainId_idx";
ALTER TABLE "Document" RENAME CONSTRAINT "Document_projectId_fkey" TO "Document_domainId_fkey";
ALTER INDEX "Document_projectId_idx" RENAME TO "Document_domainId_idx";

-- Keep the homonymous forum category aligned with the renamed feature.
UPDATE "ForumCategory"
SET
  "name" = 'Domaines',
  "slug" = 'domaines',
  "description" = 'Discussions liées aux domaines (tracteur, arrosage, chambre fraîche…).'
WHERE "slug" = 'projets';
