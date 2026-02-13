const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

router.get('/member/dashboard', authenticate, authorizeRoles('member'), controller.getMemberDashboard);
router.get('/trainer/dashboard', authenticate, authorizeRoles('trainer'), controller.getTrainerDashboard);

module.exports = router;
