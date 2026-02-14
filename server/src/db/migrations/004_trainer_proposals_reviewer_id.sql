ALTER TABLE trainer_proposals
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

UPDATE trainer_proposals
SET reviewer_id = review_id
WHERE reviewer_id IS NULL
  AND review_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_trainer_proposals_reviewer_id ON trainer_proposals(reviewer_id);
