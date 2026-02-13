const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getMemberDashboard = asyncHandler(async (req, res) => {
  const dashboard = await service.getMemberDashboard(req.user.userId);
  res.json({ dashboard });
});

const getTrainerDashboard = asyncHandler(async (req, res) => {
  const dashboard = await service.getTrainerDashboard(req.user.userId);
  res.json({ dashboard });
});

module.exports = {
  getMemberDashboard,
  getTrainerDashboard,
};
