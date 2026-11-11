const Anthropic = require("@anthropic-ai/sdk");
const AppError = require("../utils/AppError");
const { EXERCISES, EXERCISE_BY_ID, demoUrl } = require("../data/exercises");
const { cmToFeetInches, kgToLbs } = require("../utils/units");

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EXERCISE_IDS = EXERCISES.map((exercise) => exercise.id);

// The rules Claude follows for every plan
const SYSTEM_PROMPT = `You are PocketCoach, an experienced personal trainer and nutrition coach writing a one-week plan inside a fitness app.
Rules:
- Give general fitness and nutrition guidance only. No medical advice or diagnoses, and no supplements beyond protein powder.
- Match the plan to the client's goal, experience and training days per week. Use exactly that many training days; the other days are rest or light recovery.
- People who have never trained, and beginners, get simple movements, moderate volume and clear form notes.
- Only use exercises from the provided library, by exerciseId.
- Respect the diet preference in the sample meals.
- Calories must be realistic for the client's size and goal, and never below 1,200 per day.
- Keep notes to one short, encouraging sentence.
Save the plan with the save_weekly_plan tool.`;

// The "form" Claude must fill in. Its answer always comes back in this exact shape.
const PLAN_TOOL = {
  name: "save_weekly_plan",
  description: "Save the client's 7-day workout and nutrition plan.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "2-3 sentences explaining this week's approach" },
      days: {
        type: "array",
        description: "Exactly 7 days, Monday to Sunday",
        items: {
          type: "object",
          properties: {
            day: { type: "string", enum: DAYS },
            focus: { type: "string", description: "e.g. Upper body, Legs, Rest and recovery" },
            isRest: { type: "boolean" },
            exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  exerciseId: { type: "string", enum: EXERCISE_IDS },
                  sets: { type: "integer" },
                  reps: { type: "string", description: "e.g. 8-10 or 30 sec" },
                  restSec: { type: "integer" },
                  notes: { type: "string" },
                },
                required: ["exerciseId", "sets", "reps", "restSec"],
              },
            },
          },
          required: ["day", "focus", "isRest", "exercises"],
        },
      },
      nutrition: {
        type: "object",
        properties: {
          calories: { type: "integer" },
          proteinG: { type: "integer" },
          carbsG: { type: "integer" },
          fatG: { type: "integer" },
          tips: { type: "array", items: { type: "string" } },
          sampleMeals: {
            type: "array",
            items: {
              type: "object",
              properties: { meal: { type: "string" }, description: { type: "string" } },
              required: ["meal", "description"],
            },
          },
        },
        required: ["calories", "proteinG", "carbsG", "fatG", "tips", "sampleMeals"],
      },
    },
    required: ["summary", "days", "nutrition"],
  },
};

// Created on first use, so a missing key can't crash the server at startup
let client;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AppError("The AI coach isn't set up (missing ANTHROPIC_API_KEY)", 500);
  }
  if (!client) client = new Anthropic(); // reads ANTHROPIC_API_KEY from .env
  return client;
}

function describeClient(profile) {
  const { feet, inches } = cmToFeetInches(profile.heightCm);
  return [
    `Age: ${profile.age}`,
    `Height: ${profile.heightCm} cm (${feet} ft ${inches} in)`,
    `Weight: ${profile.weightKg} kg (${kgToLbs(profile.weightKg)} lbs)`,
    `Training experience: ${profile.experience}`,
    `Goal: ${profile.goal}`,
    `Training days per week: ${profile.daysPerWeek}`,
    `Diet preference: ${profile.dietPref}`,
  ].join("\n");
}

// Keep a number inside a safe range
function clamp(value, min, max) {
  const number = Math.round(Number(value));
  if (Number.isNaN(number)) return min;
  return Math.min(max, Math.max(min, number));
}

// Never trust AI output blindly: check and clean it before saving
function validatePlan(raw) {
  if (!raw || !Array.isArray(raw.days) || raw.days.length !== 7 || !raw.nutrition) {
    throw new AppError("The AI coach returned an incomplete plan. Please try again.", 502);
  }

  const days = raw.days.map((day, index) => ({
    day: DAYS[index], // always Monday to Sunday, in order
    focus: String(day.focus || (day.isRest ? "Rest and recovery" : "Training")),
    isRest: Boolean(day.isRest),
    exercises: (day.exercises || [])
      .filter((ex) => EXERCISE_BY_ID[ex.exerciseId]) // drop anything not in our library
      .map((ex) => {
        const name = EXERCISE_BY_ID[ex.exerciseId].name;
        return {
          exerciseId: ex.exerciseId,
          name,
          sets: clamp(ex.sets, 1, 10),
          reps: String(ex.reps || "10"),
          restSec: clamp(ex.restSec, 15, 300),
          notes: String(ex.notes || ""),
          demoUrl: demoUrl(name),
        };
      }),
  }));

  const n = raw.nutrition;
  return {
    summary: String(raw.summary || ""),
    days,
    nutrition: {
      calories: clamp(n.calories, 1200, 5000),
      proteinG: clamp(n.proteinG, 40, 400),
      carbsG: clamp(n.carbsG, 0, 800),
      fatG: clamp(n.fatG, 20, 300),
      tips: (n.tips || []).slice(0, 5).map(String),
      sampleMeals: (n.sampleMeals || []).slice(0, 6).map((m) => ({
        meal: String(m.meal || ""),
        description: String(m.description || ""),
      })),
    },
  };
}

async function generateWeeklyPlan(profile) {
  const library = EXERCISES.map((e) => `- ${e.id}: ${e.name} (${e.category}, ${e.level})`).join("\n");

  let response;
  try {
    response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      tools: [PLAN_TOOL],
      tool_choice: { type: "tool", name: PLAN_TOOL.name }, // must answer by filling in the form
      messages: [
        {
          role: "user",
          content: `Create this week's plan for this client.\n\nClient:\n${describeClient(profile)}\n\nExercise library:\n${library}`,
        },
      ],
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Anthropic API error:", error.status, error.message);
    throw new AppError("The AI coach is unavailable right now. Please try again in a minute.", 502);
  }

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse) {
    throw new AppError("The AI coach gave an unexpected answer. Please try again.", 502);
  }
  return validatePlan(toolUse.input);
}

module.exports = { generateWeeklyPlan, MODEL };