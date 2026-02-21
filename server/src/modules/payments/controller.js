const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const mockPay = asyncHandler(async (req, res) => {
  const { courseId, cardLastFour } = req.body;
  const result = await service.processMockPayment(req.user.userId, { courseId, cardLastFour });
  res.status(201).json({ payment: result });
});

module.exports = { mockPay };
