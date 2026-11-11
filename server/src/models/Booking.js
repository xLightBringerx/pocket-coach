const mongoose = require("mongoose");
const { DATE_PATTERN, TIME_PATTERN } = require("../utils/time");

const STATUSES = ["pending", "confirmed", "declined", "cancelled", "completed"];

const bookingSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "TrainerProfile", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    date: { type: String, required: true, match: [DATE_PATTERN, "Date must look like 2026-11-30"] },
    startTime: { type: String, required: true, match: [TIME_PATTERN, "Use HH:MM"] },
    endTime: { type: String, required: true, match: [TIME_PATTERN, "Use HH:MM"] },
    // Copied from the service when booked, so later price changes don't affect this booking
    durationMin: { type: Number, required: true },
    price: { type: Number, required: true, min: 0 },
    status: { type: String, enum: STATUSES, default: "pending" },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

// Indexes make the most common lookups fast
bookingSchema.index({ trainer: 1, date: 1 });
bookingSchema.index({ client: 1, date: 1 });

module.exports = mongoose.model("Booking", bookingSchema);