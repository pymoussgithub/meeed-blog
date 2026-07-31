-- Full-text search indexes for forum (FB-17)
CREATE INDEX IF NOT EXISTS "ForumTopic_title_fts_idx"
  ON "ForumTopic"
  USING GIN (to_tsvector('french', title));

CREATE INDEX IF NOT EXISTS "ForumPost_body_fts_idx"
  ON "ForumPost"
  USING GIN (to_tsvector('french', body));
