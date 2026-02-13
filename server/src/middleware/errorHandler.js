const AppError = require('../utils/appError');

function notFoundHandler(req, res, next) {
  next(new AppError(404, 'Route not found'));
}

function errorHandler(error, req, res, _next) {
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
