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
  const mappedLessons = lessons
    ? lessons.map((lesson) => ({
        lessonId: lesson.lesson_id,
        title: lesson.title,
        content: lesson.content,
      }))
    : undefined;

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
    enrolledCount: row.enrolled_count,
    createdAt: row.created_at,
    lessons: mappedLessons,
    syllabus: mappedLessons ? mappedLessons.map((lesson) => lesson.title) : undefined,
  };
}

async function listCourses({ query, trainerId, limit, offset }) {
  const rows = await repository.listCourses({ query, trainerId, limit, offset });
  return {
    courses: rows.map((row) => mapCourse(row)),
    total: rows[0]?.total_count || 0,
  };
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
    lessons: payload.lessons,
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

  const rawLessons = sanitized.lessons !== undefined ? sanitized.lessons : payload.syllabus;

  if (rawLessons !== undefined && !Array.isArray(rawLessons)) {
    const fieldName = sanitized.lessons !== undefined ? 'lessons' : 'syllabus';
    throw new AppError(400, `${fieldName} must be an array`);
  }

  if (Array.isArray(rawLessons)) {
    sanitized.lessons = rawLessons
      .map((item, index) => {
        if (typeof item === 'string') {
          const title = item.trim();
          if (!title) return null;
          return { title, content: null };
        }

        if (!item || typeof item !== 'object') {
          throw new AppError(400, `lesson at index ${index} must be an object`);
        }

        const title = String(item.title || '').trim();
        const content = item.content === undefined || item.content === null ? null : String(item.content).trim();

        if (!title && !content) {
          return null;
        }

        if (!title) {
          throw new AppError(400, `lesson at index ${index} requires a title`);
        }

        return {
          title,
          content: content || null,
        };
      })
      .filter(Boolean);
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

    await repository.replaceCourseLessons(client, courseId, sanitized.lessons || []);
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

    if (sanitized.lessons !== undefined) {
      await repository.replaceCourseLessons(client, courseId, sanitized.lessons);
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

async function deleteCourse(courseId, actor) {
  const course = await repository.findCourseById(courseId);

  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  const isOwner = course.trainer_id === actor.userId;
  const isAdmin = actor.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new AppError(403, 'You do not have access to delete this course');
  }

  const deleted = await repository.deleteCourse(courseId);
  if (!deleted) {
    throw new AppError(404, 'Course not found');
  }
}

module.exports = {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  enrollMember,
  deleteCourse,
};
