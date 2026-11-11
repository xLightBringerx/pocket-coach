const express = require("express");
const {
  getSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
} = require("../controllers/bookingController");
const { protect, requireRole } = require("../middleware/auth");

const router = express.Router();

// Public: anyone can see open times
router.get("/slots", getSlots);

// Everything below needs a logged-in user
router.use(protect);

router.get("/mine", getMyBookings);
router.post("/", requireRole("client"), createBooking);
router.patch("/:id/cancel", cancelBooking); // client or trainer
router.patch("/:id/reschedule", requireRole("client"), rescheduleBooking);
router.patch("/:id/status", requireRole("trainer"), updateBookingStatus);

module.exports = router;