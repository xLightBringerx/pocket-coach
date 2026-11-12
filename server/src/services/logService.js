const Log = require("../models/Log");
const AppError = require("../utils/AppError");
const { EXERCISE_BY_ID } = require("../data/exercises");
const { DATE_PATTERN, addDays } = require("../utils/time");

function checkDate(date) {
  if (!DATE_PATTERN.test(date || "")) {
    throw new AppError("Date must look like 2026-11-30", 400);
  }
}

// All of a user's logs from Monday (weekStart) to Sunday
function listWeekLogs(userId, weekStart) {
  checkDate(weekStart);
  return Log.find({
    user: userId,
    date: { $gte: weekStart, $lte: addDays(weekStart, 6) },
  }).sort({ date: 1, createdAt: 1 });
}

async function logWorkout(userId, { date, exerciseId }) {
  checkDate(date);
  const exercise = EXERCISE_BY_ID[exerciseId];
  if (!exercise) throw new AppError("Unknown exercise", 400);

  // Ticking the same exercise twice on one day doesn't make a duplicate
  const existing = await Log.findOne({ user: userId, date, type: "workout", exerciseId });
  if (existing) return existing;

  return Log.create({ user: userId, date, type: "workout", exerciseId, exerciseName: exercise.name });
}

async function logMeal(userId, { date, mealName, calories, proteinG, carbsG, fatG }) {
  checkDate(date);
  if (!mealName || !String(mealName).trim()) {
    throw new AppError("Meal name is required", 400);
  }
  return Log.create({
    user: userId,
    date,
    type: "meal",
    mealName: String(mealName).trim(),
    calories: Number(calories) || 0,
    proteinG: Number(proteinG) || 0,
    carbsG: Number(carbsG) || 0,
    fatG: Number(fatG) || 0,
  });
}

async function deleteLog(userId, logId) {
  const log = await Log.findOne({ _id: logId, user: userId }); // only your own logs
  if (!log) throw new AppError("Log entry not found", 404);
  await log.deleteOne();
}

module.exports = { listWeekLogs, logWorkout, logMeal, deleteLog };