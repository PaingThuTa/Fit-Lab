const jwt = require('../utils/jwt');
const AppError = require('../utils/appError');
const { findUserById } = require('../modules/users/repository');
const { toClientRole } = require('../utils/role');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'Authentication required'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new AppError(500, 'Missing JWT_SECRET configuration'));
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await findUserById(decoded.userId);

    if (!user) {
      return next(new AppError(401, 'Invalid authentication token'));
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      role: toClientRole(user.role),
      roleDb: user.role,
    };

    return next();
  } catch (_error) {
    return next(new AppError(401, 'Invalid or expired token'));
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden'));
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
