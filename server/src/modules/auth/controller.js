const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./service');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  res.json({ user });
});

module.exports = {
  register,
  login,
  me,
};
