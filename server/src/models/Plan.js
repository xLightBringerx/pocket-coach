const mongoose = require("mongoose");

const planExerciseSchema = new mongoose.Schema(
  {
    exerciseId: { type: String, required: true },
    name: { type: String, required: true },
    sets: { type: Number, min: 1, max: 10 },
    reps: { type: String }, // text, so "8-10" or "30 sec" both work
    restSec: { type: Number, min: 0, max: 600 },
    notes: { type: String, default: "" },
    demoUrl: { type: String },
  },
  { _id: false }
);

const planDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // "Monday"
    focus: { type: String, default: "" }, // "Upper body"
    isRest: { type: Boolean, default: false },
    exercises: [planExerciseSchema],
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema({ meal: String, description: String }, { _id: false });

// The AI's review of the week: the numbers it was given, plus its summary and changes
const checkInSchema = new mongoose.Schema(
  {
    summary: String,
    adjustments: [String],
    workoutsPlanned: Number,
    workoutsDone: Number,
    exercisesPlanned: Number,
    exercisesDone: Number,
    mealDaysLogged: Number,
    avgCalories: Number,
    avgProteinG: Number,
    createdAt: Date,
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weekStart: { type: String, required: true }, // the Monday of that week, "2026-11-09"
    summary: { type: String, default: "" },
    days: [planDaySchema],
    nutrition: {
      calories: Number,
      proteinG: Number,
      carbsG: Number,
      fatG: Number,
      tips: [String],
      sampleMeals: [mealSchema],
    },
    aiModel: { type: String, default: "" }, // which AI model wrote it
    appliedAdjustments: [String], // check-in changes this plan was built with
    checkIn: checkInSchema, // this week's AI check-in (empty until the client runs one)
  },
  { timestamps: true }
);

// One plan per user per week
planSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("Plan", planSchema);