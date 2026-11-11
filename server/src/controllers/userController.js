const userService = require("../services/userService");
const { toPublicUser } = require("../services/authService");

async function updateProfile(req, res, next) {
  try {
    const user = await userService.updateMyProfile(req.user, req.body);
    res.json({ user: toPublicUser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = { updateProfile };