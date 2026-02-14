CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_courses_name_trgm
ON courses USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_courses_description_trgm
ON courses USING GIN (description gin_trgm_ops);
