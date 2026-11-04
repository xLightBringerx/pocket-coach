const authService = require("../services/authService");
const AppError = require("../utils/AppError");

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

async function register(req, res, next) {
  try {
    const { name, email, password, role = "client" } = req.body;

    if (!name || !email || !password) {
      throw new AppError("Name, email and password are required", 400);
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError("Please enter a valid email", 400);
    }
    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }
    // Nobody can sign themselves up as an admin
    if (!["client", "trainer"].includes(role)) {
      throw new AppError("Role must be client or trainer", 400);
    }

    const result = await authService.registerUser({ name, email, password, role });
    res.status(201).json(result);
  } catch (error) {
    next(error); // hand the error to the error handler
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }
    const result = await authService.loginUser({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// req.user is set by the protect middleware
function getMe(req, res) {
  res.json({ user: authService.toPublicUser(req.user) });
}

module.exports = { register, login, getMe };