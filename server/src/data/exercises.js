// The exercise library. The AI can only pick from this list, and every exercise
// links to real demo videos (a YouTube search for proper form), so the app
// never shows AI-made images or video.
const EXERCISES = [
  { id: "back-squat", name: "Barbell Back Squat", category: "legs", level: "intermediate" },
  { id: "goblet-squat", name: "Goblet Squat", category: "legs", level: "beginner" },
  { id: "leg-press", name: "Leg Press", category: "legs", level: "beginner" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", category: "legs", level: "intermediate" },
  { id: "deadlift", name: "Conventional Deadlift", category: "legs", level: "intermediate" },
  { id: "walking-lunge", name: "Walking Lunge", category: "legs", level: "beginner" },
  { id: "bulgarian-split-squat", name: "Bulgarian Split Squat", category: "legs", level: "intermediate" },
  { id: "hip-thrust", name: "Barbell Hip Thrust", category: "legs", level: "beginner" },
  { id: "leg-curl", name: "Lying Leg Curl", category: "legs", level: "beginner" },
  { id: "calf-raise", name: "Standing Calf Raise", category: "legs", level: "beginner" },
  { id: "bench-press", name: "Barbell Bench Press", category: "push", level: "intermediate" },
  { id: "incline-db-press", name: "Incline Dumbbell Press", category: "push", level: "beginner" },
  { id: "push-up", name: "Push-Up", category: "push", level: "beginner" },
  { id: "overhead-press", name: "Standing Overhead Press", category: "push", level: "intermediate" },
  { id: "db-shoulder-press", name: "Seated Dumbbell Shoulder Press", category: "push", level: "beginner" },
  { id: "lateral-raise", name: "Dumbbell Lateral Raise", category: "push", level: "beginner" },
  { id: "tricep-pushdown", name: "Cable Triceps Pushdown", category: "push", level: "beginner" },
  { id: "dips", name: "Parallel Bar Dips", category: "push", level: "intermediate" },
  { id: "pull-up", name: "Pull-Up", category: "pull", level: "intermediate" },
  { id: "lat-pulldown", name: "Lat Pulldown", category: "pull", level: "beginner" },
  { id: "barbell-row", name: "Barbell Bent-Over Row", category: "pull", level: "intermediate" },
  { id: "seated-cable-row", name: "Seated Cable Row", category: "pull", level: "beginner" },
  { id: "face-pull", name: "Cable Face Pull", category: "pull", level: "beginner" },
  { id: "db-curl", name: "Dumbbell Biceps Curl", category: "pull", level: "beginner" },
  { id: "hammer-curl", name: "Hammer Curl", category: "pull", level: "beginner" },
  { id: "plank", name: "Plank", category: "core", level: "beginner" },
  { id: "dead-bug", name: "Dead Bug", category: "core", level: "beginner" },
  { id: "hanging-knee-raise", name: "Hanging Knee Raise", category: "core", level: "intermediate" },
  { id: "kettlebell-swing", name: "Kettlebell Swing", category: "power", level: "intermediate" },
  { id: "box-jump", name: "Box Jump", category: "power", level: "intermediate" },
  { id: "sprint-intervals", name: "Sprint Intervals", category: "cardio", level: "intermediate" },
  { id: "incline-walk", name: "Incline Treadmill Walk", category: "cardio", level: "beginner" },
  { id: "stationary-bike", name: "Stationary Bike", category: "cardio", level: "beginner" },
  { id: "rowing-machine", name: "Rowing Machine", category: "cardio", level: "beginner" },
  { id: "jump-rope", name: "Jump Rope", category: "cardio", level: "beginner" },
];

// Quick lookup: EXERCISE_BY_ID["push-up"] -> { id, name, ... }
const EXERCISE_BY_ID = Object.fromEntries(EXERCISES.map((exercise) => [exercise.id, exercise]));

// Link to real demo videos for an exercise
function demoUrl(exerciseName) {
  const search = encodeURIComponent(`${exerciseName} proper form`);
  return `https://www.youtube.com/results?search_query=${search}`;
}

module.exports = { EXERCISES, EXERCISE_BY_ID, demoUrl };