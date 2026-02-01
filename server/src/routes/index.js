const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

router.get('/roles', (req, res) => {
  res.json({ roles: ['member', 'trainer', 'admin'] });
});

module.exports = router;
