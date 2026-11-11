// Friendly names for the goal values stored in the database
export const GOAL_LABELS = {
  bodybuilding: "Bodybuilding",
  athletic: "Athletic performance",
  lifestyle: "Lifestyle",
  "weight-loss": "Weight loss",
};

export const GOALS = Object.keys(GOAL_LABELS);

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// 75 -> "$75"
export function formatPrice(amount) {
  return priceFormatter.format(amount);
}

// 60 -> "60 min"
export function formatDuration(minutes) {
  return `${minutes} min`;
}

// "14:00" -> "2:00 pm"
export function formatTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

// "Jordan Reyes" -> "JR" (used instead of photos)
export function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}