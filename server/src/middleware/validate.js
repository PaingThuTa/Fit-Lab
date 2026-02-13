const AppError = require('../utils/appError');

function requireFields(fieldNames) {
  return (req, res, next) => {
    const missingFields = fieldNames.filter((fieldName) => {
      const value = req.body[fieldName];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length) {
      return next(new AppError(400, 'Missing required fields', { missingFields }));
    }

    return next();
  };
}

module.exports = {
  requireFields,
};
