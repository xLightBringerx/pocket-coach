const express = require("express");
const {
  getServices,
  getService,
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();
const trainerOnly = [protect, requireRole("trainer")];

router.get("/", getServices);
router.get("/mine", trainerOnly, getMyServices);
router.get("/:id", getService);
router.post("/", trainerOnly, createService);
router.put("/:id", trainerOnly, updateService);
router.delete("/:id", trainerOnly, deleteService);

module.exports = router;