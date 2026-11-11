const express = require("express");
const { generate, getCurrent } = require("../controllers/planController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// Every plan route is for logged-in clients only
router.use(protect, requireRole("client"));

router.get("/current", getCurrent);
router.post("/generate", generate);

module.exports = router;