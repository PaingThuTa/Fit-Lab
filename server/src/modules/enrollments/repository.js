const pool = require('../../config/db');

async function listMemberEnrollments(memberId) {
  const { rows } = await pool.query(
    `SELECT
       e.member_id,
       e.course_id,
       e.enrolled_at,
       e.progress_percent,
       c.name AS course_name,
       c.description AS course_description,
       c.session_count,
       c.duration_label,
       c.difficulty,
       c.price,
       u.full_name AS trainer_name
     FROM enrollments e
     JOIN courses c ON c.course_id = e.course_id
     JOIN users u ON u.user_id = c.trainer_id
     WHERE e.member_id = $1
     ORDER BY e.enrolled_at DESC`,
    [memberId]
  );

  return rows;
}

async function listTrainerEnrollments(trainerId) {
  const { rows } = await pool.query(
    `SELECT
       e.member_id,
       e.course_id,
       e.enrolled_at,
       e.progress_percent,
       c.name AS course_name,
       c.session_count,
       c.difficulty,
       m.full_name AS member_name,
       m.email AS member_email
     FROM enrollments e
     JOIN courses c ON c.course_id = e.course_id
     JOIN users m ON m.user_id = e.member_id
     WHERE c.trainer_id = $1
     ORDER BY e.enrolled_at DESC`,
    [trainerId]
  );

  return rows;
}

module.exports = {
  listMemberEnrollments,
  listTrainerEnrollments,
};
