
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('MEMBER', 'TRAINER', 'ADMIN');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_difficulty') THEN
    CREATE TYPE course_difficulty AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proposal_status') THEN
    CREATE TYPE proposal_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;


-- users  
CREATE TABLE IF NOT EXISTS users (
  user_id       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  full_name     VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL DEFAULT 'MEMBER',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- courses — created & owned by trainers
CREATE TABLE IF NOT EXISTS courses (
  course_id     UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id    UUID              NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  name          VARCHAR(255)      NOT NULL,
  description   TEXT,
  category      TEXT,
  difficulty    course_difficulty,
  price         DECIMAL(10, 2)    NOT NULL CHECK (price >= 0),
  thumbnail_url TEXT,
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- lessons — belong to a course
CREATE TABLE IF NOT EXISTS lessons (
  lesson_id UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID          NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  title     VARCHAR(255)  NOT NULL,
  content   TEXT
);

--  enrollments — member ↔ course many-to-many
CREATE TABLE IF NOT EXISTS enrollments (
  member_id   UUID        NOT NULL REFERENCES users(user_id)   ON DELETE CASCADE,
  course_id   UUID        NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (member_id, course_id)
);

--  messages — direct messages between users, optionally tied to a course
CREATE TABLE IF NOT EXISTS messages (
  message_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  course_id   UUID        REFERENCES courses(course_id) ON DELETE SET NULL,
  content     TEXT        NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at     TIMESTAMPTZ
);

-- trainer_proposals — member applies → admin reviews
CREATE TABLE IF NOT EXISTS trainer_proposals (
  proposal_id      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID            NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  message          TEXT            NOT NULL DEFAULT '',
  status           proposal_status NOT NULL DEFAULT 'PENDING',
  reviewer_id      UUID            REFERENCES users(user_id) ON DELETE SET NULL,
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

 -- payments — mock payment records (member pays for a course)
CREATE TABLE IF NOT EXISTS payments (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID           NOT NULL REFERENCES users(user_id)   ON DELETE CASCADE,
  course_id      UUID           NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  amount         NUMERIC(10,2)  NOT NULL,
  currency       VARCHAR(3)     NOT NULL DEFAULT 'USD',
  status         VARCHAR(20)    NOT NULL DEFAULT 'success',
  card_last_four CHAR(4),
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);


-- indexes
-- courses
CREATE INDEX IF NOT EXISTS idx_courses_trainer_id     ON courses(trainer_id);
CREATE INDEX IF NOT EXISTS idx_courses_created_at     ON courses(created_at DESC);

-- enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_member_id  ON enrollments(member_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id  ON enrollments(course_id);

-- messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver_sent_at   ON messages(sender_id, receiver_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender_sent_at   ON messages(receiver_id, sender_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_course_id                 ON messages(course_id);

-- trainer_proposals
CREATE INDEX IF NOT EXISTS idx_trainer_proposals_status       ON trainer_proposals(status);
CREATE INDEX IF NOT EXISTS idx_trainer_proposals_user_id      ON trainer_proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_trainer_proposals_reviewer_id  ON trainer_proposals(reviewer_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);




-- Data Seedings
--  Users
INSERT INTO users (user_id, email, password_hash, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'morgan@fit-lab.app',  crypt('Admin123!',   gen_salt('bf', 12)), 'Morgan Lee',   'ADMIN'),
  ('00000000-0000-0000-0000-000000000002', 'avery@fit-lab.app',   crypt('Trainer123!', gen_salt('bf', 12)), 'Avery Cole',   'TRAINER'),
  ('00000000-0000-0000-0000-000000000003', 'dev@fit-lab.app',     crypt('Trainer123!', gen_salt('bf', 12)), 'Dev Kapoor',   'TRAINER'),
  ('00000000-0000-0000-0000-000000000004', 'jordan@fit-lab.app',  crypt('Member123!',  gen_salt('bf', 12)), 'Jordan Wells', 'MEMBER'),
  ('00000000-0000-0000-0000-000000000005', 'parker@fit-lab.app',  crypt('Member123!',  gen_salt('bf', 12)), 'Parker Chen',  'MEMBER'),
  ('00000000-0000-0000-0000-000000000006', 'skylar@fit-lab.app',  crypt('Member123!',  gen_salt('bf', 12)), 'Skylar Patel', 'MEMBER')
ON CONFLICT (user_id) DO UPDATE
SET email     = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role      = EXCLUDED.role;

--  Courses
INSERT INTO courses (course_id, trainer_id, name, description, category, difficulty, price, thumbnail_url) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Foundations of Strength',
    'Program focused on progressive overload, movement fundamentals, and accessory stability work.',
    'Strength', 'INTERMEDIATE', 149.00, NULL
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    'HIIT Accelerator',
    'Interval-based approach combining power, speed, and metabolic finishers to boost conditioning.',
    'Conditioning', 'BEGINNER', 129.00, NULL
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Mobility Reset',
    'Low-impact plan to restore posture, joint health, and breathing mechanics.',
    'Mobility', 'BEGINNER', 89.00, NULL
  )
ON CONFLICT (course_id) DO UPDATE
SET trainer_id    = EXCLUDED.trainer_id,
    name          = EXCLUDED.name,
    description   = EXCLUDED.description,
    category      = EXCLUDED.category,
    difficulty    = EXCLUDED.difficulty,
    price         = EXCLUDED.price,
    thumbnail_url = EXCLUDED.thumbnail_url;

-- Lessons
INSERT INTO lessons (lesson_id, course_id, title, content) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Movement assessment',          NULL),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Tempo lifting for strength',   NULL),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Accessory stability toolkit',  NULL),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Power intervals',              NULL),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Cardio ladders',               NULL),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Metabolic finishers',          NULL),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'Daily mobility ritual',        NULL),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'Breathwork primer',            NULL),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'Restorative flows',            NULL)
ON CONFLICT (lesson_id) DO UPDATE
SET course_id = EXCLUDED.course_id,
    title     = EXCLUDED.title,
    content   = EXCLUDED.content;

-- Enrollments
INSERT INTO enrollments (member_id, course_id) VALUES
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (member_id, course_id) DO NOTHING;

--  Trainer Proposals
INSERT INTO trainer_proposals (proposal_id, user_id, message, status, rejection_reason) VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000006',
    'I would like to coach members through progressive strength cycles.',
    'PENDING',
    NULL
  )
ON CONFLICT (proposal_id) DO UPDATE
SET user_id          = EXCLUDED.user_id,
    message          = EXCLUDED.message,
    status           = EXCLUDED.status,
    rejection_reason = EXCLUDED.rejection_reason,
    updated_at       = NOW();

-- Messages
INSERT INTO messages (message_id, sender_id, receiver_id, course_id, content, sent_at, read_at) VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Can you share a quick warm-up for hamstrings?',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '20 hours'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Uploaded the warm-up video to your resources.',
    NOW() - INTERVAL '18 hours',
    NOW() - INTERVAL '17 hours'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    'Shared cues for tempo squats and a deload option.',
    NOW() - INTERVAL '1 hour',
    NULL
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'Friday felt heavy last week. Should I scale?',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '90 minutes'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    'Let''s lower Friday intensity to 70% this week.',
    NOW() - INTERVAL '30 minutes',
    NULL
  )
ON CONFLICT (message_id) DO UPDATE
SET sender_id   = EXCLUDED.sender_id,
    receiver_id = EXCLUDED.receiver_id,
    course_id   = EXCLUDED.course_id,
    content     = EXCLUDED.content,
    sent_at     = EXCLUDED.sent_at,
    read_at     = EXCLUDED.read_at;



-- Find user by email
 
SELECT user_id, email, password_hash, full_name, role, created_at
FROM users
WHERE LOWER(email) = LOWER($1)
LIMIT 1;


-- B2  Find User by ID (getMe / JWT middleware)

SELECT user_id, email, password_hash, full_name, role, created_at
FROM users
WHERE user_id = $1
LIMIT 1;


-- create/register user

INSERT INTO users (email, password_hash, full_name, role)
VALUES ($1, $2, $3, $4)
RETURNING user_id, email, full_name, role, created_at;


--  Hash Password 

SELECT crypt($1, gen_salt('bf', 12)) AS password_hash;


--  Verify Password (pgcrypto bcrypt)

SELECT crypt($1, $2) = $2 AS is_valid;

-- Admin Role
-- Dash-Board

-- C1.1  Total users
SELECT COUNT(*)::INT AS count FROM users;

-- C1.2  Total members
SELECT COUNT(*)::INT AS count FROM users WHERE role = 'MEMBER';

-- C1.3  Total trainers
SELECT COUNT(*)::INT AS count FROM users WHERE role = 'TRAINER';

-- C1.4  Pending & approved trainer proposals
SELECT
  COUNT(*) FILTER (WHERE status = 'PENDING')::INT  AS pending,
  COUNT(*) FILTER (WHERE status = 'APPROVED')::INT AS approved
FROM trainer_proposals;

-- C1.5  Total courses
SELECT COUNT(*)::INT AS count FROM courses;

-- C1.6  Total enrollments
SELECT COUNT(*)::INT AS count FROM enrollments;


-- Admin — List All Users with Proposal Status

SELECT
  u.user_id,
  u.full_name,
  u.email,
  u.role,
  p.status AS proposal_status
FROM users u
LEFT JOIN trainer_proposals p ON p.user_id = u.user_id
ORDER BY u.created_at DESC;

--  Admin — List All Trainer Proposals

SELECT
  p.proposal_id,
  p.user_id,
  p.message,
  p.status,
  p.reviewer_id,
  p.reviewed_at,
  p.rejection_reason,
  p.created_at,
  p.updated_at,
  applicant.full_name AS applicant_name,
  applicant.email     AS applicant_email,
  reviewer.full_name  AS reviewer_name
FROM trainer_proposals p
JOIN users applicant ON applicant.user_id = p.user_id
LEFT JOIN users reviewer ON reviewer.user_id = p.reviewer_id
ORDER BY p.updated_at DESC;


-- Admin — Find Proposal by ID (before deciding)
SELECT proposal_id, user_id, status
FROM trainer_proposals
WHERE proposal_id = $1
LIMIT 1;


--  Admin — Approve / Reject Trainer Proposal  (inside transaction)

BEGIN;

-- Update the proposal decision
UPDATE trainer_proposals
SET status           = $2,
    reviewer_id      = $3,
    reviewed_at      = NOW(),
    rejection_reason = $4,
    updated_at       = NOW()
WHERE proposal_id = $1
RETURNING proposal_id, user_id, status;

-- If APPROVED → promote user to TRAINER

UPDATE users
SET role = $2
WHERE user_id = $1
RETURNING user_id, email, full_name, role, created_at;

COMMIT;



-- Admin — List All Payments (filtered, paginated)
SELECT
  p.id,
  p.member_id,
  m.full_name    AS member_name,
  c.course_id,
  c.name         AS course_name,
  c.trainer_id,
  t.full_name    AS trainer_name,
  p.amount,
  p.currency,
  p.status,
  p.card_last_four,
  p.created_at,
  COUNT(*) OVER() AS total_count
FROM payments p
JOIN users   m ON p.member_id  = m.user_id
JOIN courses c ON p.course_id  = c.course_id
JOIN users   t ON c.trainer_id = t.user_id
WHERE
  ($1::text IS NULL OR
    m.full_name ILIKE '%'||$1||'%' OR
    t.full_name ILIKE '%'||$1||'%' OR
    c.name      ILIKE '%'||$1||'%' OR
    p.id::text  ILIKE '%'||$1||'%')
  AND ($2::text IS NULL        OR p.status     = $2)
  AND ($3::uuid IS NULL        OR p.member_id  = $3::uuid)
  AND ($4::uuid IS NULL        OR c.trainer_id = $4::uuid)
  AND ($5::uuid IS NULL        OR p.course_id  = $5::uuid)
  AND ($6::timestamptz IS NULL OR p.created_at >= $6::timestamptz)
  AND ($7::timestamptz IS NULL OR p.created_at <= $7::timestamptz)
ORDER BY p.created_at DESC
LIMIT $8 OFFSET $9;


--  Admin — Payment Summary (aggregate stats)
SELECT
  COUNT(*)::INT                                       AS total_count,
  COALESCE(SUM(amount), 0)::NUMERIC                    AS total_revenue,
  COUNT(*) FILTER (WHERE status = 'success')::INT      AS paid_count,
  COUNT(*) FILTER (WHERE status = 'pending')::INT      AS pending_count,
  COUNT(*) FILTER (WHERE status = 'failed')::INT       AS failed_count,
  COUNT(*) FILTER (WHERE status = 'refunded')::INT     AS refunded_count
FROM payments;



-- Trainer Role
-- Dash-Board
--  List trainer's own courses 
WITH course_rows AS (
  SELECT
    c.course_id,
    c.trainer_id,
    c.name,
    c.description,
    c.category,
    c.difficulty,
    c.price,
    c.thumbnail_url,
    c.created_at,
    u.full_name             AS trainer_name,
    COUNT(e.member_id)::INT AS enrolled_count
  FROM courses c
  JOIN users u ON u.user_id = c.trainer_id
  LEFT JOIN enrollments e ON e.course_id = c.course_id
  WHERE c.trainer_id = $1
  GROUP BY c.course_id, u.full_name
)
SELECT
  course_rows.*,
  COUNT(*) OVER()::INT AS total_count
FROM course_rows
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;


--  Total enrollments across trainer's courses
SELECT COUNT(*)::INT AS count
FROM enrollments e
JOIN courses c ON c.course_id = e.course_id
WHERE c.trainer_id = $1;


--  Unique message-thread count
SELECT COUNT(DISTINCT CONCAT(
  LEAST(sender_id::TEXT, receiver_id::TEXT),
  ':',
  GREATEST(sender_id::TEXT, receiver_id::TEXT),
  ':',
  COALESCE(course_id::TEXT, 'no-course')
))::INT AS count
FROM messages
WHERE sender_id = $1 OR receiver_id = $1;


-- Create Courses
BEGIN;

INSERT INTO courses (trainer_id, name, description, category, difficulty, price, thumbnail_url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING course_id;

COMMIT;


-- Trainer — Update Course
BEGIN;

--  Dynamic UPDATE — only provided fields are set
UPDATE courses
SET name          = $1,
    description   = $2,
    category      = $3,
    difficulty    = $4,
    price         = $5,
    thumbnail_url = $6
WHERE course_id = $7;


COMMIT;

-- Delete and replace existing lessons for the course

DELETE FROM lessons
WHERE course_id = $1;


INSERT INTO lessons (course_id, title, content)
VALUES ($1, $2, $3);


-- Trainer — Delete Course

DELETE FROM courses
WHERE course_id = $1;


-- Trainer — List Enrollments (Members in My Courses)  
SELECT
  e.member_id,
  e.course_id,
  e.enrolled_at,
  c.name        AS course_name,
  c.difficulty,
  m.full_name   AS member_name,
  m.email       AS member_email
FROM enrollments e
JOIN courses c ON c.course_id = e.course_id
JOIN users   m ON m.user_id   = e.member_id
WHERE c.trainer_id = $1
ORDER BY e.enrolled_at DESC;


-- Member Role
-- Get course rows with trainer name and enrolled count, applying optional filters,
WITH course_rows AS (
  SELECT
    c.course_id,
    c.trainer_id,
    c.name,
    c.description,
    c.category,
    c.difficulty,
    c.price,
    c.thumbnail_url,
    c.created_at,
    u.full_name             AS trainer_name,
    COUNT(e.member_id)::INT AS enrolled_count
  FROM courses c
  JOIN users u ON u.user_id = c.trainer_id
  LEFT JOIN enrollments e ON e.course_id = c.course_id
  -- {whereClause}
  GROUP BY c.course_id, u.full_name
)
SELECT
  course_rows.*,
  COUNT(*) OVER()::INT AS total_count
FROM course_rows
ORDER BY created_at DESC
-- {paginationClause}
;
--  Member — View Single Course Detail

SELECT
  c.course_id,
  c.trainer_id,
  c.name,
  c.description,
  c.category,
  c.difficulty,
  c.price,
  c.thumbnail_url,
  c.created_at,
  u.full_name             AS trainer_name,
  COUNT(e.member_id)::INT AS enrolled_count
FROM courses c
JOIN users u ON u.user_id = c.trainer_id
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE c.course_id = $1
GROUP BY c.course_id, u.full_name
LIMIT 1;


--   Member — Get Lessons for a Course

SELECT lesson_id, title, content
FROM lessons
WHERE course_id = $1
ORDER BY lesson_id ASC;




-- Member — List My Enrollments

SELECT
  e.member_id,
  e.course_id,
  e.enrolled_at,
  c.name        AS course_name,
  c.description AS course_description,
  c.difficulty,
  c.price,
  u.full_name   AS trainer_name
FROM enrollments e
JOIN courses c ON c.course_id = e.course_id
JOIN users   u ON u.user_id   = c.trainer_id
WHERE e.member_id = $1
ORDER BY e.enrolled_at DESC;


--  Member — Mock Payment & Enroll  (inside transaction)

BEGIN;

--  Insert payment record

INSERT INTO payments (member_id, course_id, amount, currency, status, card_last_four)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

--   Create enrollment in the same transaction

INSERT INTO enrollments (member_id, course_id)
VALUES ($1, $2)
ON CONFLICT (member_id, course_id) DO NOTHING;

COMMIT;






-- Member — Get My Trainer Proposal

SELECT
  p.proposal_id,
  p.user_id,
  p.message,
  p.status,
  p.reviewer_id,
  p.reviewed_at,
  p.rejection_reason,
  p.created_at,
  p.updated_at,
  reviewer.full_name AS reviewer_name
FROM trainer_proposals p
LEFT JOIN users reviewer ON reviewer.user_id = p.reviewer_id
WHERE p.user_id = $1
LIMIT 1;



-- Creates new proposal OR resets an existing rejected one back to PENDING
INSERT INTO trainer_proposals (
  user_id,
  message,
  status,
  reviewer_id,
  reviewed_at,
  rejection_reason,
  updated_at
) VALUES ($1, $2, 'PENDING', NULL, NULL, NULL, NOW())
ON CONFLICT (user_id)
DO UPDATE SET
  message          = EXCLUDED.message,
  status           = 'PENDING',
  reviewer_id      = NULL,
  reviewed_at      = NULL,
  rejection_reason = NULL,
  updated_at       = NOW()
RETURNING proposal_id;



-- Messaging for all roles
--  List Conversation Threads (Inbox)
-- Returns one row per unique (other_user, course) conversation with the last message
WITH thread_base AS (
  SELECT
    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
    m.course_id,
    MAX(m.sent_at) AS last_sent_at
  FROM messages m
  WHERE m.sender_id = $1 OR m.receiver_id = $1
  GROUP BY
    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END,
    m.course_id
)
SELECT
  tb.other_user_id,
  tb.course_id,
  tb.last_sent_at,
  ou.full_name AS other_user_name,
  c.name       AS course_name,
  lm.content   AS last_message,
  lm.sender_id AS last_message_sender_id
FROM thread_base tb
JOIN users ou ON ou.user_id = tb.other_user_id
LEFT JOIN courses c ON c.course_id = tb.course_id
LEFT JOIN LATERAL (
  SELECT content, sender_id
  FROM messages m2
  WHERE
    ((m2.sender_id = $1 AND m2.receiver_id = tb.other_user_id) OR
     (m2.sender_id = tb.other_user_id AND m2.receiver_id = $1))
    AND ((tb.course_id IS NULL AND m2.course_id IS NULL) OR m2.course_id = tb.course_id)
  ORDER BY m2.sent_at DESC
  LIMIT 1
) lm ON TRUE
ORDER BY tb.last_sent_at DESC;


-- List Messages in a Thread

SELECT
  m.message_id,
  m.sender_id,
  m.receiver_id,
  m.course_id,
  m.content,
  m.sent_at,
  m.read_at,
  s.full_name AS sender_name,
  r.full_name AS receiver_name
FROM messages m
JOIN users s ON s.user_id = m.sender_id
JOIN users r ON r.user_id = m.receiver_id
WHERE
  ((m.sender_id = $1 AND m.receiver_id = $2) OR
   (m.sender_id = $2 AND m.receiver_id = $1))
  -- Dynamic: AND m.course_id = $3   (only when courseId is provided)
ORDER BY m.sent_at ASC;

-- Send a Message

INSERT INTO messages (sender_id, receiver_id, course_id, content)
VALUES ($1, $2, $3, $4)
RETURNING message_id, sender_id, receiver_id, course_id, content, sent_at, read_at;
