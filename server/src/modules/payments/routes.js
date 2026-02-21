const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

// POST /api/payments/mock-pay  { courseId, cardLastFour }
router.post('/mock-pay', authenticate, authorizeRoles('member'), controller.mockPay);

module.exports = router;
