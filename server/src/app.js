const express = require('express');
const apiRouter = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/+$/, '').toLowerCase();
const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const envAllowedOrigins = String(process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...defaultAllowedOrigins, ...envAllowedOrigins];
const allowedOriginSet = new Set(allowedOrigins.map(normalizeOrigin).filter(Boolean));

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  const normalizedRequestOrigin = requestOrigin ? normalizeOrigin(requestOrigin) : '';
  const isAllowedRequestOrigin = requestOrigin && allowedOriginSet.has(normalizedRequestOrigin);
  const requestedHeaders = req.headers['access-control-request-headers'];

  if (isAllowedRequestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      requestedHeaders || 'Content-Type,Authorization'
    );
  }

  if (req.method === 'OPTIONS') {
    if (requestOrigin && !isAllowedRequestOrigin) {
      return res.status(403).json({ message: `Origin ${requestOrigin} is not allowed by CORS` });
    }

    return res.sendStatus(204);
  }

  return next();
});
app.use(express.json());
app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
