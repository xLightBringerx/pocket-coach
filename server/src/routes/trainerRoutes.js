const express = require("express");
const { getTrainers, getTrainer, getMyProfile, updateMyProfile } = require("../controllers/trainerController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public
router.get("/", getTrainers);

// Trainer only
router.get("/me/profile", protect, requireRole("trainer"), getMyProfile);
router.put("/me/profile", protect, requireRole("trainer"), updateMyProfile);

// Public (keep last)
router.get("/:id", getTrainer);

module.exports = router;