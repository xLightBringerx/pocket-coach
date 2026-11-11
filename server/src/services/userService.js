const AppError = require("../utils/AppError");
const { feetInchesToCm, lbsToKg } = require("../utils/units");

const REQUIRED_FIELDS = ["age", "experience", "goal", "daysPerWeek"];

async function updateMyProfile(user, body) {
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === "") {
      throw new AppError(`${field} is required`, 400);
    }
  }

  // Always store cm and kg, whichever units the user typed
  const units = body.units === "metric" ? "metric" : "imperial";
  let heightCm;
  let weightKg;
  if (units === "imperial") {
    heightCm = feetInchesToCm(Number(body.heightFt), Number(body.heightIn || 0));
    weightKg = lbsToKg(Number(body.weightLbs));
  } else {
    heightCm = Number(body.heightCm);
    weightKg = Number(body.weightKg);
  }
  if (!heightCm || !weightKg) throw new AppError("Height and weight are required", 400);

  user.profile = {
    age: Number(body.age),
    heightCm,
    weightKg,
    experience: body.experience,
    goal: body.goal,
    daysPerWeek: Number(body.daysPerWeek),
    dietPref: body.dietPref || "none",
    units,
  };
  user.onboardingComplete = true;
  await user.save(); // runs the min/max/enum checks from the User model
  return user;
}

module.exports = { updateMyProfile };