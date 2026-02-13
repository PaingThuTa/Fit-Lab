const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getThreads = asyncHandler(async (req, res) => {
  const threads = await service.getThreads(req.user.userId);
  res.json({ threads });
});

const getThreadMessages = asyncHandler(async (req, res) => {
  const messages = await service.getThreadMessages({
    userId: req.user.userId,
    otherUserId: req.query.otherUserId,
    courseId: req.query.courseId || null,
  });

  res.json({ messages });
});

module.exports = {
  getThreads,
  getThreadMessages,
};
