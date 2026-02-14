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

const postMessage = asyncHandler(async (req, res) => {
  const message = await service.sendMessage({
    userId: req.user.userId,
    receiverId: req.body.receiverId,
    courseId: req.body.courseId || null,
    content: req.body.content,
  });

  res.status(201).json({ message });
});

module.exports = {
  getThreads,
  getThreadMessages,
  postMessage,
};
