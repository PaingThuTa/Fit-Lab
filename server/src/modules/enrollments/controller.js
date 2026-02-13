const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await service.getMemberEnrollments(req.user.userId);
  res.json({ enrollments });
});

const getTrainerEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await service.getTrainerEnrollments(req.user.userId);
  res.json({ enrollments });
});

module.exports = {
  getMyEnrollments,
  getTrainerEnrollments,
};
