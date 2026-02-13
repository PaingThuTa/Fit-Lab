const ROLE_VALUES = ['MEMBER', 'TRAINER', 'ADMIN'];

function toDbRole(role) {
  if (!role) return null;
  const normalized = String(role).trim().toUpperCase();
  if (!ROLE_VALUES.includes(normalized)) return null;
  return normalized;
}

function toClientRole(role) {
  if (!role) return null;
  return String(role).toLowerCase();
}

module.exports = {
  ROLE_VALUES,
  toDbRole,
  toClientRole,
};
