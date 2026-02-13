const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, authorizeRoles('member'), controller.getMyEnrollments);
router.get('/trainer', authenticate, authorizeRoles('trainer'), controller.getTrainerEnrollments);

module.exports = router;
