const express = require('express');

const authRoutes = require('../modules/auth/routes');
const courseRoutes = require('../modules/courses/routes');
const enrollmentRoutes = require('../modules/enrollments/routes');
const proposalRoutes = require('../modules/proposals/routes');
const adminRoutes = require('../modules/admin/routes');
const dashboardRoutes = require('../modules/dashboard/routes');
const messagingRoutes = require('../modules/messaging/routes');
const uploadRoutes = require('../modules/upload/routes');
const paymentRoutes = require('../modules/payments/routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

router.get('/roles', (req, res) => {
  res.json({ roles: ['member', 'trainer', 'admin'] });
});

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/trainer-proposals', proposalRoutes);
router.use('/admin', adminRoutes);
router.use('/', dashboardRoutes);
router.use('/messages', messagingRoutes);
router.use('/upload', uploadRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
