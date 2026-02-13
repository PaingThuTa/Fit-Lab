const express = require('express');
const controller = require('./controller');
const { authenticate } = require('../../middleware/auth');
const { requireFields } = require('../../middleware/validate');

const router = express.Router();

router.post('/register', requireFields(['fullName', 'email', 'password']), controller.register);
router.post('/login', requireFields(['email', 'password']), controller.login);
router.get('/me', authenticate, controller.me);

module.exports = router;
