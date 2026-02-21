const express = require('express');
const controller = require('./controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

router.post(
  '/image',
  authenticate,
  authorizeRoles('trainer', 'admin'),
  upload.single('image'),
  controller.uploadImage
);

module.exports = router;
