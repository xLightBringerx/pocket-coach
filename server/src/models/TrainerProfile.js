const mongoose = require("mongoose");
const { GOALS } = require("../utils/constants");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/; // 24-hour time like "09:00" or "17:30"

// One block of weekly availability, e.g. Monday 09:00 to 17:00
const availabilitySchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday ... 6 = Saturday
    start: { type: String, match: [TIME_PATTERN, "Use HH:MM, like 09:00"], required: true },
    end: { type: String, match: [TIME_PATTERN, "Use HH:MM, like 17:00"], required: true },
  },
  { _id: false }
);

const trainerProfileSchema = new mongoose.Schema(
  {
    // Links this profile to a User with role "trainer" (one profile per user)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, trim: true, maxlength: 1000, default: "" },
    specialties: [{ type: String, enum: GOALS }],
    yearsExperience: { type: Number, min: 0, max: 60, default: 0 },
    location: { type: String, trim: true, default: "" },
    photoUrl: { type: String, trim: true, default: "" },
    // Hidden from clients until an admin approves the trainer
    approved: { type: Boolean, default: false },
    availability: [availabilitySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrainerProfile", trainerProfileSchema);