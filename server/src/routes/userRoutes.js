const express = require("express");
const { updateProfile } = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.put("/me/profile", protect, requireRole("client"), updateProfile);

module.exports = router;