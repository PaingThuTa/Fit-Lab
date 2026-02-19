-- =============================================================
-- Extracted SQL from: server/src/modules/courses/repository.js
-- Purpose: Reference of all SQL used by each repository function
-- Notes:
--   1) Parameters use PostgreSQL positional placeholders ($1, $2, ...)
--   2) Some queries are dynamic in JS (WHERE / SET / pagination parts)
-- =============================================================

-- -------------------------------------------------------------
-- Function: listCourses({ query, trainerId, limit, offset })
-- Description:
--   Lists courses with trainer name and enrollment counts.
--   Supports optional text search, trainer filter, and pagination.
-- Dynamic pieces from JS:
--   {whereClause}      -> built from query/trainerId conditions
--   {paginationClause} -> LIMIT/OFFSET only if both are integers
-- -------------------------------------------------------------
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
    u.full_name AS trainer_name,
    COUNT(e.member_id)::INT AS enrolled_count
  FROM courses c
  JOIN users u ON u.user_id = c.trainer_id
  LEFT JOIN enrollments e ON e.course_id = c.course_id
  {whereClause}
  GROUP BY c.course_id, u.full_name
)
SELECT
  course_rows.*,
  COUNT(*) OVER()::INT AS total_count
FROM course_rows
ORDER BY created_at DESC
{paginationClause};


-- -------------------------------------------------------------
-- Function: findCourseById(courseId)
-- Description:
--   Gets one course by ID with trainer name and enrollment count.
-- -------------------------------------------------------------
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
  u.full_name AS trainer_name,
  COUNT(e.member_id)::INT AS enrolled_count
FROM courses c
JOIN users u ON u.user_id = c.trainer_id
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE c.course_id = $1
GROUP BY c.course_id, u.full_name
LIMIT 1;


-- -------------------------------------------------------------
-- Function: listLessonsByCourseId(courseId)
-- Description:
--   Lists all lessons for a course.
-- -------------------------------------------------------------
SELECT lesson_id, title, content
FROM lessons
WHERE course_id = $1
ORDER BY lesson_id ASC;


-- -------------------------------------------------------------
-- Function: createCourse(client, payload)
-- Description:
--   Creates a course and returns generated course_id.
-- -------------------------------------------------------------
INSERT INTO courses (
  trainer_id,
  name,
  description,
  category,
  difficulty,
  price,
  thumbnail_url
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING course_id;


-- -------------------------------------------------------------
-- Fu $xnction: updateCourse(client, courseId, updates)
-- Description:
--   Updates only fields provided in updates object.
-- Dynamic piece from JS:
--   SET clause is built from whichever fields are present in updates:
--     name = $x
--     description = $x
--     category = $x
--     difficulty = $x
--     price = $x
--     thumbnail_url =
--
-- Concrete example (all updatable fields provided):
--   UPDATE courses
--   SET name = $1,
--       description = $2,
--       category = $3,
--       difficulty = $4,
--       price = $5,
--       thumbnail_url = $6
--   WHERE course_id = $7;
-- -------------------------------------------------------------
UPDATE courses
SET name = $1,
    description = $2,
    category = $3,
    difficulty = $4,
    price = $5,
    thumbnail_url = $6
WHERE course_id = $7;


-- -------------------------------------------------------------
-- Function: replaceCourseLessons(client, courseId, lessons)
-- Description:
--   Replaces all lessons for a course:
--     1) deletes existing lessons
--     2) inserts new lessons one-by-one
-- -------------------------------------------------------------
DELETE FROM lessons
WHERE course_id = $1;

INSERT INTO lessons (course_id, title, content)
VALUES ($1, $2, $3);


-- -------------------------------------------------------------
-- Function: createEnrollment({ memberId, courseId })
-- Description:
--   Creates enrollment, ignores duplicates.
-- -------------------------------------------------------------
INSERT INTO enrollments (member_id, course_id)
VALUES ($1, $2)
ON ;


-- -------------------------------------------------------------
-- Function: deleteCouCONFLICT (member_id, course_id) DO NOTHINGrse(courseId)
-- Description:
--   Deletes a course by ID.
-- -------------------------------------------------------------
DELETE FROM courses
WHERE course_id = $1;


-- =============================================================
-- Extracted SQL from: server/src/modules/messaging/repository.js
-- Purpose: SQL used by trainer/member messaging endpoints
-- =============================================================

-- -------------------------------------------------------------
-- Function: listThreads(userId)
-- Description:
--   Lists conversation threads for a user (trainer included),
--   grouped by other participant + course context, including last message.
-- -------------------------------------------------------------
WITH thread_base AS (
  SELECT
    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AS other_user_id,
    m.course_id,
    MAX(m.sent_at) AS last_sent_at
  FROM messages m
  WHERE m.sender_id = $1 OR m.receiver_id = $1
  GROUP BY CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END, m.course_id
)
SELECT
  tb.other_user_id,
  tb.course_id,
  tb.last_sent_at,
  ou.full_name AS other_user_name,
  c.name AS course_name,
  lm.content AS last_message,
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


-- -------------------------------------------------------------
-- Function: listThreadMessages({ userId, otherUserId, courseId })
-- Description:
--   Lists all messages between two users, optionally scoped to one course.
-- Dynamic piece from JS:
--   {courseCondition}:
--     - empty when no courseId is provided
--     - "AND m.course_id = $3" when courseId exists
-- -------------------------------------------------------------
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
  {courseCondition}
ORDER BY m.sent_at ASC;


-- -------------------------------------------------------------
-- Function: createMessage({ senderId, receiverId, courseId, content })
-- Description:
--   Persists a new message and returns created row fields.
-- -------------------------------------------------------------
INSERT INTO messages (sender_id, receiver_id, course_id, content)
VALUES ($1, $2, $3, $4)
RETURNING message_id, sender_id, receiver_id, course_id, content, sent_at, read_at;


-- =============================================================
-- Extracted SQL for: MEMBER role
-- Sources:
--   server/src/modules/enrollments/repository.js
--   server/src/modules/proposals/repository.js
--   server/src/modules/dashboard/service.js
-- =============================================================

-- -------------------------------------------------------------
-- Function: listMemberEnrollments(memberId)           [enrollments/repository.js]
-- Description:
--   Returns all courses a member is enrolled in, with course
--   details and trainer name. Ordered by most recently enrolled.
-- -------------------------------------------------------------
SELECT
  e.member_id,
  e.course_id,
  e.enrolled_at,
  c.name AS course_name,
  c.description AS course_description,
  c.difficulty,
  c.price,
  u.full_name AS trainer_name
FROM enrollments e
JOIN courses c ON c.course_id = e.course_id
JOIN users u ON u.user_id = c.trainer_id
WHERE e.member_id = $1
ORDER BY e.enrolled_at DESC;


-- -------------------------------------------------------------
-- Function: findProposalByUserId(userId)              [proposals/repository.js]
-- Description:
--   Fetches a member's own trainer application (proposal),
--   including reviewer name if already reviewed.
-- -------------------------------------------------------------
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


-- -------------------------------------------------------------
-- Function: upsertProposal({ userId, message })       [proposals/repository.js]
-- Description:
--   Creates a new trainer proposal or resets an existing one
--   back to PENDING (e.g. after a rejection, member can reapply).
-- -------------------------------------------------------------
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
  message = EXCLUDED.message,
  status = 'PENDING',
  reviewer_id = NULL,
  reviewed_at = NULL,
  rejection_reason = NULL,
  updated_at = NOW()
RETURNING proposal_id;


-- -------------------------------------------------------------
-- Function: getMemberDashboard(userId)                [dashboard/service.js]
-- Description:
--   Counts total enrollments for the member dashboard stat card.
--   (Full course list + enrollment list reuse queries above.)
-- Note: This inline query appears directly in dashboard/service.js
--   via enrollmentsRepository.listMemberEnrollments() and
--   coursesRepository.listCourses(), already documented above.
--   The only extra inline SQL is the enrollment count below:
-- -------------------------------------------------------------
SELECT COUNT(*)::INT AS count
FROM enrollments
WHERE member_id = $1;


-- -------------------------------------------------------------
-- Member: Browse & search all courses                 [courses/repository.js → listCourses]
-- Description:
--   Used on /member/courses to list all available courses.
--   Supports free-text search across name, description, and trainer name.
--   Supports pagination via LIMIT / OFFSET.
-- Parameters:
--   $1 -> search term wrapped in %% (e.g. '%yoga%'), only when query is provided
--   $2 -> LIMIT  (page size)
--   $3 -> OFFSET (page start)
-- Dynamic pieces:
--   {whereClause}      -> "WHERE (c.name ILIKE $1 OR c.description ILIKE $1 OR u.full_name ILIKE $1)"
--                         omitted entirely when no search term is provided
--   {paginationClause} -> "LIMIT $2 OFFSET $3" omitted when not paginating
-- -------------------------------------------------------------
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
    u.full_name AS trainer_name,
    COUNT(e.member_id)::INT AS enrolled_count
  FROM courses c
  JOIN users u ON u.user_id = c.trainer_id
  LEFT JOIN enrollments e ON e.course_id = c.course_id
  -- {whereClause} e.g.:
  -- WHERE (c.name ILIKE $1 OR c.description ILIKE $1 OR u.full_name ILIKE $1)
  GROUP BY c.course_id, u.full_name
)
SELECT
  course_rows.*,
  COUNT(*) OVER()::INT AS total_count
FROM course_rows
ORDER BY created_at DESC
-- {paginationClause} e.g.:
-- LIMIT $2 OFFSET $3
;


-- -------------------------------------------------------------
-- Member: View a single course detail                 [courses/repository.js → findCourseById]
-- Description:
--   Used on /member/courses/:courseId to show full course info.
-- Parameters:
--   $1 -> course_id (UUID)
-- -------------------------------------------------------------
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
  u.full_name AS trainer_name,
  COUNT(e.member_id)::INT AS enrolled_count
FROM courses c
JOIN users u ON u.user_id = c.trainer_id
LEFT JOIN enrollments e ON e.course_id = c.course_id
WHERE c.course_id = $1
GROUP BY c.course_id, u.full_name
LIMIT 1;


-- -------------------------------------------------------------
-- Member: Get lessons for a course                    [courses/repository.js → listLessonsByCourseId]
-- Description:
--   Lists lesson titles and content for a course detail page.
--   Content is only meaningful to enrolled members.
-- Parameters:
--   $1 -> course_id (UUID)
-- -------------------------------------------------------------
SELECT lesson_id, title, content
FROM lessons
WHERE course_id = $1
ORDER BY lesson_id ASC;


-- -------------------------------------------------------------
-- Member: Enroll in a course                          [courses/repository.js → createEnrollment]
-- Description:
--   Creates an enrollment record for the member.
--   Silently ignores if the member is already enrolled (ON CONFLICT DO NOTHING).
-- Parameters:
--   $1 -> member_id (UUID)
--   $2 -> course_id (UUID)
-- -------------------------------------------------------------
INSERT INTO enrollments (member_id, course_id)
VALUES ($1, $2)
ON CONFLICT (member_id, course_id) DO NOTHING;
