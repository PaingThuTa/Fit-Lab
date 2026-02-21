const AppError = require('../utils/appError');
const multer = require('multer');

function notFoundHandler(req, res, next) {
  next(new AppError(404, 'Route not found'));
}

function errorHandler(error, req, res, _next) {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB)' : error.message;
    return res.status(400).json({ message });
  }

  const statusCode = error.statusCode || 500;
  const payload = {
    message: error.message || 'Internal server error',
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
