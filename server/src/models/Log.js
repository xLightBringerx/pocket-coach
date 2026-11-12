const mongoose = require("mongoose");
const { DATE_PATTERN } = require("../utils/time");

const logSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true, match: [DATE_PATTERN, "Date must look like 2026-11-30"] },
    type: { type: String, enum: ["workout", "meal"], required: true },

    // Workout entries: which exercise from the plan was done
    exerciseId: { type: String },
    exerciseName: { type: String },

    // Meal entries
    mealName: { type: String, trim: true, maxlength: 100 },
    calories: { type: Number, min: 0, max: 5000 },
    proteinG: { type: Number, min: 0, max: 400 },
    carbsG: { type: Number, min: 0, max: 800 },
    fatG: { type: Number, min: 0, max: 300 },
  },
  { timestamps: true }
);

logSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model("Log", logSchema);