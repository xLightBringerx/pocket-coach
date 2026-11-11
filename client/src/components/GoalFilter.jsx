import { GOALS, GOAL_LABELS } from "../utils/format";

export default function GoalFilter({ value, onChange }) {
  return (
    <div className="chip-row" role="group" aria-label="Filter by goal">
      <button
        type="button"
        className={value === "" ? "chip active" : "chip"}
        aria-pressed={value === ""}
        onClick={() => onChange("")}
      >
        All
      </button>
      {GOALS.map((goal) => (
        <button
          key={goal}
          type="button"
          className={value === goal ? "chip active" : "chip"}
          aria-pressed={value === goal}
          onClick={() => onChange(goal)}
        >
          {GOAL_LABELS[goal]}
        </button>
      ))}
    </div>
  );
}