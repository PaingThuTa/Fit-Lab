DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'trainer_proposals'
      AND column_name = 'review_id'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'trainer_proposals'
      AND column_name = 'reviewer_id'
  ) THEN
    ALTER TABLE trainer_proposals
    RENAME COLUMN review_id TO reviewer_id;
  END IF;
END $$;

ALTER TABLE trainer_proposals
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'trainer_proposals'
      AND column_name = 'review_id'
  ) THEN
    UPDATE trainer_proposals
    SET reviewer_id = COALESCE(reviewer_id, review_id)
    WHERE review_id IS NOT NULL;

    ALTER TABLE trainer_proposals
    DROP COLUMN review_id;
  END IF;
END $$;

ALTER TABLE courses
DROP COLUMN IF EXISTS duration_label;

ALTER TABLE courses
DROP COLUMN IF EXISTS session_count;

ALTER TABLE courses
DROP COLUMN IF EXISTS spot_limit;

ALTER TABLE lessons
DROP COLUMN IF EXISTS position;

ALTER TABLE enrollments
DROP COLUMN IF EXISTS progress_percent;

ALTER TABLE trainer_proposals
DROP COLUMN IF EXISTS specialties;

ALTER TABLE trainer_proposals
DROP COLUMN IF EXISTS certifications;

ALTER TABLE trainer_proposals
DROP COLUMN IF EXISTS experience_years;

ALTER TABLE trainer_proposals
DROP COLUMN IF EXISTS sample_course;

ALTER TABLE trainer_proposals
DROP COLUMN IF EXISTS bio;

CREATE INDEX IF NOT EXISTS idx_trainer_proposals_reviewer_id ON trainer_proposals(reviewer_id);
