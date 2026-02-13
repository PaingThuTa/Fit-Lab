const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getMyProposal = asyncHandler(async (req, res) => {
  const proposal = await service.getMyProposal(req.user.userId);
  res.json({ proposal });
});

const upsertMyProposal = asyncHandler(async (req, res) => {
  const proposal = await service.upsertMyProposal(req.user.userId, req.body);
  res.json({ proposal });
});

module.exports = {
  getMyProposal,
  upsertMyProposal,
};
