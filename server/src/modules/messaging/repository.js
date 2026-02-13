const pool = require('../../config/db');

async function listThreads(userId) {
  const { rows } = await pool.query(
    `WITH thread_base AS (
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
    ORDER BY tb.last_sent_at DESC`
    ,
    [userId]
  );

  return rows;
}

async function listThreadMessages({ userId, otherUserId, courseId }) {
  const values = [userId, otherUserId];
  let courseCondition = '';

  if (courseId) {
    values.push(courseId);
    courseCondition = `AND m.course_id = $3`;
  }

  const { rows } = await pool.query(
    `SELECT
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
       ${courseCondition}
     ORDER BY m.sent_at ASC`,
    values
  );

  return rows;
}

module.exports = {
  listThreads,
  listThreadMessages,
};
