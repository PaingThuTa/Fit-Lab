CREATE TABLE IF NOT EXISTS payments (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID         NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  course_id    UUID         NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  amount       NUMERIC(10,2) NOT NULL,
  currency     VARCHAR(3)   NOT NULL DEFAULT 'USD',
  status       VARCHAR(20)  NOT NULL DEFAULT 'success',
  card_last_four CHAR(4),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments (member_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments (course_id);
