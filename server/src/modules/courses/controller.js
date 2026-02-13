const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const listCourses = asyncHandler(async (req, res) => {
  const query = req.query.query ? String(req.query.query).trim() : '';
  const trainerId = req.query.trainerId ? String(req.query.trainerId) : null;
  const courses = await service.listCourses({
    query,
    trainerId: req.query.mine === 'true' ? req.user?.userId || null : trainerId,
  });
  res.json({ courses });
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

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  enrollCourse,
};
