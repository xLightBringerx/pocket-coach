const express = require("express");
const { getWeekLogs, addWorkout, addMeal, removeLog } = require("../controllers/logController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// Logging is for logged-in clients only
router.use(protect, requireRole("client"));

router.get("/", getWeekLogs); // ?weekStart=2026-11-09
router.post("/workout", addWorkout);
router.post("/meal", addMeal);
router.delete("/:id", removeLog);

module.exports = router;