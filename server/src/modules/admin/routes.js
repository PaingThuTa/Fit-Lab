const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));
router.get('/users', controller.getUsers);
router.get('/courses', controller.getCourses);
router.get('/dashboard', controller.getDashboard);
router.get('/trainer-proposals', controller.getTrainerProposals);
router.patch('/trainer-proposals/:proposalId', controller.patchTrainerProposal);

module.exports = router;
