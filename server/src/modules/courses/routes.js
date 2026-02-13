const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');

const router = express.Router();

router.get('/', controller.listCourses);
router.get('/:courseId', controller.getCourse);
router.post('/', authenticate, authorizeRoles('trainer', 'admin'), controller.createCourse);
router.patch('/:courseId', authenticate, authorizeRoles('trainer', 'admin'), controller.updateCourse);
router.post('/:courseId/enroll', authenticate, authorizeRoles('member'), controller.enrollCourse);

module.exports = router;
