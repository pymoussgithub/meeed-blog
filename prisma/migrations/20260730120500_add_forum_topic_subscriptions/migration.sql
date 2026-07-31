CREATE TABLE "ForumTopicSubscription" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ForumTopicSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ForumTopicSubscription_topicId_userId_key"
ON "ForumTopicSubscription"("topicId", "userId");

CREATE INDEX "ForumTopicSubscription_userId_isActive_updatedAt_idx"
ON "ForumTopicSubscription"("userId", "isActive", "updatedAt");

CREATE INDEX "ForumTopicSubscription_topicId_isActive_idx"
ON "ForumTopicSubscription"("topicId", "isActive");

ALTER TABLE "ForumTopicSubscription"
ADD CONSTRAINT "ForumTopicSubscription_topicId_fkey"
FOREIGN KEY ("topicId") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ForumTopicSubscription"
ADD CONSTRAINT "ForumTopicSubscription_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "ForumTopicSubscription" ("id", "topicId", "userId", "isActive", "createdAt", "updatedAt")
SELECT
    'fts_' || md5(ft."id" || ':' || ft."authorId"),
    ft."id",
    ft."authorId",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ForumTopic" ft
WHERE ft."authorId" IS NOT NULL
ON CONFLICT ("topicId", "userId") DO NOTHING;

INSERT INTO "ForumTopicSubscription" ("id", "topicId", "userId", "isActive", "createdAt", "updatedAt")
SELECT
    'fps_' || md5(fp."topicId" || ':' || fp."authorId"),
    fp."topicId",
    fp."authorId",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "ForumPost" fp
WHERE fp."authorId" IS NOT NULL
ON CONFLICT ("topicId", "userId") DO NOTHING;
