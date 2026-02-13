const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, authorizeRoles('member', 'trainer'), controller.getMyProposal);
router.put('/me', authenticate, authorizeRoles('member', 'trainer'), controller.upsertMyProposal);

module.exports = router;
