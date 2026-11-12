const Plan = require("../models/Plan");
const AppError = require("../utils/AppError");
const aiService = require("./aiService");
const logService = require("./logService");

// Stops repeated clicks on Regenerate or Check in (each call costs money)
const COOLDOWN_SEC = 60;

const pad = (n) => String(n).padStart(2, "0");

// The Monday of the current week as "YYYY-MM-DD"
function currentWeekStart() {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

function isCoolingDown(date) {
  return Boolean(date) && Date.now() - new Date(date).getTime() < COOLDOWN_SEC * 1000;
}

// Which check-in adjustments a new plan should be built with
async function findAdjustmentsToApply(userId, existing) {
  if (existing?.checkIn?.adjustments?.length) return [...existing.checkIn.adjustments]; // checked in this week
  if (existing?.appliedAdjustments?.length) return [...existing.appliedAdjustments]; // regenerating: keep them
  const previous = await Plan.findOne({ user: userId, "checkIn.adjustments.0": { $exists: true } }).sort({
    weekStart: -1,
  });
  return previous ? [...previous.checkIn.adjustments] : [];
}

async function generatePlan(user) {
  if (!user.onboardingComplete || !user.profile) {
    throw new AppError("Finish onboarding before generating a plan", 400);
  }

  const weekStart = currentWeekStart();
  const existing = await Plan.findOne({ user: user._id, weekStart });
  if (existing && isCoolingDown(existing.updatedAt)) {
    throw new AppError("You just made a plan. Please wait a minute before making a new one.", 429);
  }

  const adjustments = await findAdjustmentsToApply(user._id, existing);
  const planData = await aiService.generateWeeklyPlan(user.profile, adjustments);

  // Create this week's plan or replace it; a new plan starts with no check-in
  return Plan.findOneAndUpdate(
    { user: user._id, weekStart },
    {
      $set: { ...planData, aiModel: aiService.MODEL, appliedAdjustments: adjustments },
      $unset: { checkIn: 1 },
    },
    { returnDocument: "after", upsert: true, runValidators: true }
  );
}

// The newest plan, or null if the user has none yet
function getLatestPlan(userId) {
  return Plan.findOne({ user: userId }).sort({ weekStart: -1 });
}

// The server counts the numbers; the AI only writes the summary and adjustments
function buildStats(plan, logs) {
  const workoutLogs = logs.filter((l) => l.type === "workout");
  const mealLogs = logs.filter((l) => l.type === "meal");
  const trainingDays = plan.days.filter((d) => !d.isRest);
  const mealDays = new Set(mealLogs.map((l) => l.date)).size;

  // Average per day that has meals logged
  const average = (field) =>
    mealDays ? Math.round(mealLogs.reduce((sum, l) => sum + (l[field] || 0), 0) / mealDays) : 0;

  return {
    workoutsPlanned: trainingDays.length,
    workoutsDone: new Set(workoutLogs.map((l) => l.date)).size,
    exercisesPlanned: trainingDays.reduce((sum, d) => sum + d.exercises.length, 0),
    exercisesDone: workoutLogs.length,
    mealDaysLogged: mealDays,
    avgCalories: average("calories"),
    avgProteinG: average("proteinG"),
    avgCarbsG: average("carbsG"),
    avgFatG: average("fatG"),
  };
}

async function runCheckIn(user) {
  const plan = await getLatestPlan(user._id);
  if (!plan) throw new AppError("Build a plan before checking in", 400);
  if (isCoolingDown(plan.checkIn?.createdAt)) {
    throw new AppError("You just checked in. Please wait a minute before trying again.", 429);
  }

  const logs = await logService.listWeekLogs(user._id, plan.weekStart);
  const stats = buildStats(plan, logs);
  const result = await aiService.generateCheckIn(user.profile, plan, stats, logs);

  plan.checkIn = { ...stats, ...result, createdAt: new Date() };
  await plan.save();
  return plan;
}

module.exports = { generatePlan, getLatestPlan, runCheckIn };