const { Server } = require('socket.io');
const jwt = require('../utils/jwt');
const { findUserById } = require('../modules/users/repository');
const { toClientRole } = require('../utils/role');

const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/+$/, '').toLowerCase();

function resolveAllowedOrigins() {
  const defaultAllowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const envAllowedOrigins = String(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...defaultAllowedOrigins, ...envAllowedOrigins].map(normalizeOrigin).filter(Boolean));
}

function extractBearerToken(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) {
    return String(authToken).replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  }

  const rawHandshakeToken = socket.handshake?.auth?.authToken;
  if (rawHandshakeToken) {
    return String(rawHandshakeToken).replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  }

  const authHeader = socket.handshake?.headers?.authorization || '';
  const [scheme, token] = String(authHeader).split(' ');
  if (scheme === 'Bearer' && token) {
    return token.trim().replace(/^"|"$/g, '');
  }

  const queryToken = socket.handshake?.query?.token;
  if (queryToken) {
    return String(queryToken).replace(/^Bearer\s+/i, '').trim().replace(/^"|"$/g, '');
  }

  return '';
}

function registerSocketServer(httpServer) {
  const allowedOrigins = resolveAllowedOrigins();

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.has(normalizedOrigin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Origin not allowed'), false);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      next(new Error('Missing JWT_SECRET configuration'));
      return;
    }

    const token = extractBearerToken(socket);
    if (!token) {
      next(new Error('Authentication required'));
      return;
    }

    try {
      const decoded = jwt.verify(token, secret);
      const tokenUserId = decoded.userId || decoded.user_id || decoded.sub;
      if (!tokenUserId) {
        next(new Error('Invalid authentication token'));
        return;
      }

      const user = await findUserById(tokenUserId);

      if (!user) {
        next(new Error('Invalid authentication token'));
        return;
      }

      socket.data.user = {
        userId: user.user_id,
        email: user.email,
        fullName: user.full_name,
        role: toClientRole(user.role),
      };

      next();
    } catch (_error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data?.user?.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${userId}`);
  });

  return io;
}

module.exports = {
  registerSocketServer,
};
