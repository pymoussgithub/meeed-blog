-- Allow multiple projects to share the same category (1:N instead of 1:1)
DROP INDEX IF EXISTS "Project_categoryId_key";

CREATE INDEX IF NOT EXISTS "Project_categoryId_idx" ON "Project"("categoryId");
