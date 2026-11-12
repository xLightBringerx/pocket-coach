const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

// Make a login token that stores the user's id and role
function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// Only send safe fields back to the browser (never the password)
function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    onboardingComplete: user.onboardingComplete,
    profile: user.profile || null,
    photo: user.photo || "",
  };
}

async function registerUser({ name, email, password, role }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError("An account with that email already exists", 409);
  }
  const user = await User.create({ name, email, password, role });
  return { token: createToken(user), user: toPublicUser(user) };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  // Same message for wrong email or wrong password, so attackers can't tell which
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }
  return { token: createToken(user), user: toPublicUser(user) };
}

module.exports = { registerUser, loginUser, toPublicUser };