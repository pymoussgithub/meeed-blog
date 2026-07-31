-- Articles belong to projects (category → project → article)
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "projectId" TEXT;

CREATE INDEX IF NOT EXISTS "Article_projectId_idx" ON "Article"("projectId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Article_projectId_fkey'
  ) THEN
    ALTER TABLE "Article"
      ADD CONSTRAINT "Article_projectId_fkey"
      FOREIGN KEY ("projectId") REFERENCES "Project"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Assign a project from the article's linked categories that have projects
WITH ranked AS (
  SELECT
    ac."articleId",
    p.id AS "projectId",
    ROW_NUMBER() OVER (
      PARTITION BY ac."articleId"
      ORDER BY
        CASE
          WHEN a.slug ILIKE '%solaire%' OR a.slug ILIKE '%ferme-solaire%'
            OR a.title ILIKE '%solaire%' OR a.title ILIKE '%ferme solaire%'
          THEN CASE WHEN p.slug = 'ferme-solaire' THEN 0 ELSE 2 END
          WHEN a.slug ILIKE '%adiabatique%' OR a.slug ILIKE '%chambre%'
            OR a.title ILIKE '%adiabatique%' OR a.title ILIKE '%chambre%'
          THEN CASE WHEN p.slug = 'energie' THEN 0 ELSE 2 END
          ELSE 1
        END,
        p."sortOrder" ASC,
        p."createdAt" ASC
    ) AS rn
  FROM "ArticleCategory" ac
  JOIN "Article" a ON a.id = ac."articleId"
  JOIN "Project" p ON p."categoryId" = ac."categoryId"
  WHERE a."projectId" IS NULL
)
UPDATE "Article" a
SET "projectId" = ranked."projectId"
FROM ranked
WHERE a.id = ranked."articleId"
  AND ranked.rn = 1
  AND a."projectId" IS NULL;

-- Drop category links that pointed at project-bearing categories
DELETE FROM "ArticleCategory" ac
USING "Project" p
WHERE p."categoryId" = ac."categoryId";
