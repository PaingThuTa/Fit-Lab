const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const service = require('./service');

function parsePagination(req) {
  const rawLimit = req.query.limit;
  const rawOffset = req.query.offset;
  const limit = rawLimit === undefined ? 20 : Number(rawLimit);
  const offset = rawOffset === undefined ? 0 : Number(rawOffset);

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError(400, 'limit must be an integer between 1 and 100');
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new AppError(400, 'offset must be a non-negative integer');
  }

  return { limit, offset };
}

const listCourses = asyncHandler(async (req, res) => {
  const query = req.query.query ? String(req.query.query).trim() : '';
  const trainerId = req.query.trainerId ? String(req.query.trainerId) : null;
  const { limit, offset } = parsePagination(req);
  const { courses, total } = await service.listCourses({
    query,
    trainerId: req.query.mine === 'true' ? req.user?.userId || null : trainerId,
    limit,
    offset,
  });
  res.json({
    courses,
    page: {
      limit,
      offset,
      total,
    },
  });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await service.getCourseById(req.params.courseId);
  res.json({ course });
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await service.createCourse(req.body, req.user);
  res.status(201).json({ course });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await service.updateCourse(req.params.courseId, req.body, req.user);
  res.json({ course });
});

const enrollCourse = asyncHandler(async (req, res) => {
  await service.enrollMember(req.params.courseId, req.user.userId);
  res.status(201).json({ message: 'Enrollment successful' });
});

const deleteCourse = asyncHandler(async (req, res) => {
  await service.deleteCourse(req.params.courseId, req.user);
  res.status(204).send();
});

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  enrollCourse,
  deleteCourse,
};
