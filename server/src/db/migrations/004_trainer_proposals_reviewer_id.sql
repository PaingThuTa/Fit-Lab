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
    SET reviewer_id = review_id
    WHERE reviewer_id IS NULL
      AND review_id IS NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_trainer_proposals_reviewer_id ON trainer_proposals(reviewer_id);
