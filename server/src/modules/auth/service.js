const AppError = require('../../utils/appError');
const {
  createUser,
  findUserByEmail,
  findUserById,
  hashPasswordWithDb,
  verifyPasswordWithDb,
} = require('../users/repository');
const { toDbRole, toClientRole } = require('../../utils/role');
const jwt = require('../../utils/jwt');

const TOKEN_EXPIRES_IN = '7d';

function buildAuthResponse(userRow) {
  return {
    userId: userRow.user_id,
    email: userRow.email,
    fullName: userRow.full_name,
    role: toClientRole(userRow.role),
    createdAt: userRow.created_at,
  };
}

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'Missing JWT_SECRET configuration');
  }

  return jwt.sign({ userId }, secret, { expiresIn: TOKEN_EXPIRES_IN });
}

async function register(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');
  const fullName = String(payload.fullName || payload.name || '').trim();
  const requestedRole = toDbRole(payload.role) || 'MEMBER';
  const role = requestedRole === 'ADMIN' ? 'MEMBER' : requestedRole;

  if (!email || !password || !fullName) {
    throw new AppError(400, 'fullName, email, and password are required');
  }

  if (password.length < 8) {
    throw new AppError(400, 'Password must be at least 8 characters');
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new AppError(409, 'Email already in use');
  }

  const passwordHash = await hashPasswordWithDb(password);
  const user = await createUser({ email, passwordHash, fullName, role });
  const token = signToken(user.user_id);

  return {
    token,
    user: buildAuthResponse(user),
  };
}

async function login(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  if (!email || !password) {
    throw new AppError(400, 'email and password are required');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isMatch = await verifyPasswordWithDb(password, user.password_hash);
  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  return {
    token: signToken(user.user_id),
    user: buildAuthResponse(user),
  };
}

async function getMe(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return buildAuthResponse(user);
}

module.exports = {
  register,
  login,
  getMe,
};
