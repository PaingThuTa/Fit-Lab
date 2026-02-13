const pool = require('../../config/db');
const AppError = require('../../utils/appError');
const repository = require('./repository');

function toDifficulty(value) {
  if (!value) return null;
  const normalized = String(value).trim().toUpperCase();
  if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(normalized)) {
    throw new AppError(400, 'Invalid difficulty value');
  }
  return normalized;
}

function mapCourse(row, lessons = null) {
  return {
    courseId: row.course_id,
    trainerId: row.trainer_id,
    trainerName: row.trainer_name,
    name: row.name,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    price: Number(row.price),
    thumbnailUrl: row.thumbnail_url,
    durationLabel: row.duration_label,
    sessionCount: row.session_count,
    spotLimit: row.spot_limit,
    enrolledCount: row.enrolled_count,
    createdAt: row.created_at,
    syllabus: lessons ? lessons.map((lesson) => lesson.title) : undefined,
  };
}

async function listCourses({ query, trainerId }) {
  const rows = await repository.listCourses({ query, trainerId });
  return rows.map((row) => mapCourse(row));
}

async function getCourseById(courseId) {
  const course = await repository.findCourseById(courseId);
  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  const lessons = await repository.listLessonsByCourseId(courseId);
  return mapCourse(course, lessons);
}

function validateCoursePayload(payload, allowPartial = false) {
  const sanitized = {
    name: payload.name,
    description: payload.description,
    category: payload.category,
    difficulty: payload.difficulty ? toDifficulty(payload.difficulty) : undefined,
    price: payload.price,
    thumbnailUrl: payload.thumbnailUrl,
    durationLabel: payload.durationLabel,
    sessionCount: payload.sessionCount,
    spotLimit: payload.spotLimit,
    syllabus: payload.syllabus,
  };

  if (!allowPartial) {
    if (!sanitized.name) {
      throw new AppError(400, 'Course name is required');
    }
    if (sanitized.price === undefined || sanitized.price === null || Number.isNaN(Number(sanitized.price))) {
      throw new AppError(400, 'Valid price is required');
    }
  }

  if (sanitized.price !== undefined && sanitized.price !== null) {
    sanitized.price = Number(sanitized.price);
  }

  if (sanitized.sessionCount !== undefined && sanitized.sessionCount !== null) {
    sanitized.sessionCount = Number(sanitized.sessionCount);
  }

  if (sanitized.spotLimit !== undefined && sanitized.spotLimit !== null) {
    sanitized.spotLimit = Number(sanitized.spotLimit);
  }

  if (sanitized.syllabus && !Array.isArray(sanitized.syllabus)) {
    throw new AppError(400, 'syllabus must be an array of strings');
  }

  if (Array.isArray(sanitized.syllabus)) {
    sanitized.syllabus = sanitized.syllabus.map((item) => String(item).trim()).filter(Boolean);
  }

  return sanitized;
}

async function createCourse(payload, actor) {
  const sanitized = validateCoursePayload(payload, false);

  const trainerId = actor.role === 'admin' ? payload.trainerId || actor.userId : actor.userId;

  if (!trainerId) {
    throw new AppError(400, 'trainerId is required');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const courseId = await repository.createCourse(client, {
      ...sanitized,
      trainerId,
    });

    await repository.replaceCourseLessons(client, courseId, sanitized.syllabus || []);
    await client.query('COMMIT');
    return getCourseById(courseId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function updateCourse(courseId, payload, actor) {
  const course = await repository.findCourseById(courseId);

  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  const isOwner = course.trainer_id === actor.userId;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError(403, 'You do not have access to update this course');
  }

  const sanitized = validateCoursePayload(payload, true);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await repository.updateCourse(client, courseId, sanitized);

    if (sanitized.syllabus !== undefined) {
      await repository.replaceCourseLessons(client, courseId, sanitized.syllabus);
    }

    await client.query('COMMIT');
    return getCourseById(courseId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function enrollMember(courseId, memberId) {
  const course = await repository.findCourseById(courseId);
  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  const inserted = await repository.createEnrollment({ memberId, courseId });
  if (!inserted) {
    throw new AppError(409, 'Already enrolled in this course');
  }
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  enrollMember,
};
