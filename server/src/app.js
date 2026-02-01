const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;
