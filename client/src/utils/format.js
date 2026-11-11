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

export const ACTIVE_STATUSES = ["pending", "confirmed"];

export const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
  completed: "Completed",
};

// "2026-11-30" -> "Mon, Nov 30"
export function formatDate(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Today as "YYYY-MM-DD" in the user's own time zone
export function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Hours from now until a booking starts (negative once it has started)
export function hoursUntil(date, time) {
  return (new Date(`${date}T${time}`) - Date.now()) / (1000 * 60 * 60);
}

export const EXPERIENCE_OPTIONS = [
  { value: "none", label: "I've never worked out" },
  { value: "beginner", label: "Beginner (under 1 year)" },
  { value: "intermediate", label: "Intermediate (1 to 3 years)" },
  { value: "advanced", label: "Advanced (3+ years)" },
];

export const DIET_OPTIONS = [
  { value: "none", label: "No preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "keto", label: "Keto" },
  { value: "other", label: "Other" },
];