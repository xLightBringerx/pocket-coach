const express = require("express");
const { updateProfile, updatePhoto, removePhoto } = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

router.put("/me/profile", protect, requireRole("client"), updateProfile);

// Any logged-in user (client or trainer) can set their own photo
router.put("/me/photo", protect, updatePhoto);
router.delete("/me/photo", protect, removePhoto);

module.exports = router;