const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getUsers = asyncHandler(async (req, res) => {
  const users = await service.listUsers();
  res.json({ users });
});

const getCourses = asyncHandler(async (req, res) => {
  const courses = await service.listCourses();
  res.json({ courses });
});

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await service.getDashboard();
  res.json({ dashboard });
});

const getTrainerProposals = asyncHandler(async (req, res) => {
  const proposals = await service.listTrainerProposals();
  res.json({ proposals });
});

const patchTrainerProposal = asyncHandler(async (req, res) => {
  const proposal = await service.decideTrainerProposal({
    proposalId: req.params.proposalId,
    action: req.body.action,
    reviewerId: req.user.userId,
    rejectionReason: req.body.rejectionReason,
  });

  res.json({ proposal });
});

const getPayments = asyncHandler(async (req, res) => {
  const result = await service.listPayments(req.query);
  res.json(result);
});

module.exports = {
  getUsers,
  getCourses,
  getDashboard,
  getTrainerProposals,
  patchTrainerProposal,
  getPayments,
};
