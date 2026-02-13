const pool = require('../../config/db');

async function listCourses({ query, trainerId }) {
  const values = [];
  const conditions = [];

  if (query) {
    values.push(`%${query}%`);
    const idx = values.length;
    conditions.push(`(c.name ILIKE $${idx} OR c.description ILIKE $${idx} OR u.full_name ILIKE $${idx})`);
  }

  if (trainerId) {
    values.push(trainerId);
    conditions.push(`c.trainer_id = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT
       c.course_id,
       c.trainer_id,
       c.name,
       c.description,
       c.category,
       c.difficulty,
       c.price,
       c.thumbnail_url,
       c.duration_label,
       c.session_count,
       c.spot_limit,
       c.created_at,
       u.full_name AS trainer_name,
       COUNT(e.member_id)::INT AS enrolled_count
     FROM courses c
     JOIN users u ON u.user_id = c.trainer_id
     LEFT JOIN enrollments e ON e.course_id = c.course_id
     ${whereClause}
     GROUP BY c.course_id, u.full_name
     ORDER BY c.created_at DESC`,
    values
  );

  return rows;
}

async function findCourseById(courseId) {
  const { rows } = await pool.query(
    `SELECT
       c.course_id,
       c.trainer_id,
       c.name,
       c.description,
       c.category,
       c.difficulty,
       c.price,
       c.thumbnail_url,
       c.duration_label,
       c.session_count,
       c.spot_limit,
       c.created_at,
       u.full_name AS trainer_name,
       COUNT(e.member_id)::INT AS enrolled_count
     FROM courses c
     JOIN users u ON u.user_id = c.trainer_id
     LEFT JOIN enrollments e ON e.course_id = c.course_id
     WHERE c.course_id = $1
     GROUP BY c.course_id, u.full_name
     LIMIT 1`,
    [courseId]
  );

  return rows[0] || null;
}

async function listLessonsByCourseId(courseId) {
  const { rows } = await pool.query(
    `SELECT lesson_id, title, content, position
     FROM lessons
     WHERE course_id = $1
     ORDER BY position ASC, lesson_id ASC`,
    [courseId]
  );

  return rows;
}

async function createCourse(client, payload) {
  const { rows } = await client.query(
    `INSERT INTO courses (
       trainer_id,
       name,
       description,
       category,
       difficulty,
       price,
       thumbnail_url,
       duration_label,
       session_count,
       spot_limit
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING course_id`,
    [
      payload.trainerId,
      payload.name,
      payload.description || null,
      payload.category || null,
      payload.difficulty || null,
      payload.price,
      payload.thumbnailUrl || null,
      payload.durationLabel || null,
      payload.sessionCount,
      payload.spotLimit,
    ]
  );

  return rows[0].course_id;
}

async function updateCourse(client, courseId, updates) {
  const setClauses = [];
  const values = [];

  const mapping = {
    name: 'name',
    description: 'description',
    category: 'category',
    difficulty: 'difficulty',
    price: 'price',
    thumbnailUrl: 'thumbnail_url',
    durationLabel: 'duration_label',
    sessionCount: 'session_count',
    spotLimit: 'spot_limit',
  };

  Object.keys(mapping).forEach((key) => {
    if (updates[key] !== undefined) {
      values.push(updates[key]);
      setClauses.push(`${mapping[key]} = $${values.length}`);
    }
  });

  if (!setClauses.length) {
    return;
  }

  values.push(courseId);
  await client.query(`UPDATE courses SET ${setClauses.join(', ')} WHERE course_id = $${values.length}`, values);
}

async function replaceCourseLessons(client, courseId, syllabus) {
  await client.query('DELETE FROM lessons WHERE course_id = $1', [courseId]);

  if (!Array.isArray(syllabus) || syllabus.length === 0) {
    return;
  }

  for (let index = 0; index < syllabus.length; index += 1) {
    await client.query(
      `INSERT INTO lessons (course_id, title, position)
       VALUES ($1, $2, $3)`,
      [courseId, syllabus[index], index + 1]
    );
  }
}

async function createEnrollment({ memberId, courseId }) {
  const { rowCount } = await pool.query(
    `INSERT INTO enrollments (member_id, course_id)
     VALUES ($1, $2)
     ON CONFLICT (member_id, course_id) DO NOTHING`,
    [memberId, courseId]
  );

  return rowCount > 0;
}

module.exports = {
  listCourses,
  findCourseById,
  listLessonsByCourseId,
  createCourse,
  updateCourse,
  replaceCourseLessons,
  createEnrollment,
};
