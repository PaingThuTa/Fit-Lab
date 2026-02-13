const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate, authorizeRoles('member', 'trainer', 'admin'));
router.get('/threads', controller.getThreads);
router.get('/thread', controller.getThreadMessages);

module.exports = router;
