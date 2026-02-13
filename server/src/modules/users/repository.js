const pool = require('../../config/db');

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `SELECT user_id, email, password_hash, full_name, role, created_at
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findUserById(userId) {
  const { rows } = await pool.query(
    `SELECT user_id, email, password_hash, full_name, role, created_at
     FROM users
     WHERE user_id = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function createUser({ email, passwordHash, fullName, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id, email, full_name, role, created_at`,
    [email, passwordHash, fullName, role]
  );

  return rows[0];
}

async function hashPasswordWithDb(password) {
  const { rows } = await pool.query(
    `SELECT crypt($1, gen_salt('bf', 12)) AS password_hash`,
    [password]
  );

  return rows[0].password_hash;
}

async function verifyPasswordWithDb(password, passwordHash) {
  const { rows } = await pool.query(
    `SELECT crypt($1, $2) = $2 AS is_valid`,
    [password, passwordHash]
  );

  return rows[0]?.is_valid === true;
}

async function updateUserRole({ userId, role, client = null }) {
  const db = client || pool;
  const { rows } = await db.query(
    `UPDATE users
     SET role = $2
     WHERE user_id = $1
     RETURNING user_id, email, full_name, role, created_at`,
    [userId, role]
  );

  return rows[0] || null;
}

async function listUsersWithProposalStatus() {
  const { rows } = await pool.query(
    `SELECT
       u.user_id,
       u.full_name,
       u.email,
       u.role,
       p.status AS proposal_status
     FROM users u
     LEFT JOIN trainer_proposals p ON p.user_id = u.user_id
     ORDER BY u.created_at DESC`
  );

  return rows;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  hashPasswordWithDb,
  verifyPasswordWithDb,
  updateUserRole,
  listUsersWithProposalStatus,
};
