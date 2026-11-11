const Plan = require("../models/Plan");
const AppError = require("../utils/AppError");
const aiService = require("./aiService");

// Stops someone clicking Regenerate over and over (each call costs money)
const REGENERATE_COOLDOWN_SEC = 60;

const pad = (n) => String(n).padStart(2, "0");

// The Monday of the current week as "YYYY-MM-DD"
function currentWeekStart() {
  const now = new Date();
  const daysSinceMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

async function generatePlan(user) {
  if (!user.onboardingComplete || !user.profile) {
    throw new AppError("Finish onboarding before generating a plan", 400);
  }

  const weekStart = currentWeekStart();
  const existing = await Plan.findOne({ user: user._id, weekStart });
  if (existing && Date.now() - existing.updatedAt.getTime() < REGENERATE_COOLDOWN_SEC * 1000) {
    throw new AppError("You just made a plan. Please wait a minute before making a new one.", 429);
  }

  const planData = await aiService.generateWeeklyPlan(user.profile);

  // Create this week's plan, or replace it if one already exists
  return Plan.findOneAndUpdate(
    { user: user._id, weekStart },
    { ...planData, aiModel: aiService.MODEL },
    { new: true, upsert: true, runValidators: true }
  );
}

// The newest plan, or null if the user has none yet
function getLatestPlan(userId) {
  return Plan.findOne({ user: userId }).sort({ weekStart: -1 });
}

module.exports = { generatePlan, getLatestPlan };