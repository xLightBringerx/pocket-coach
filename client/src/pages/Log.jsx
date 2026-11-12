import { useState } from "react";
import { Link } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { fetchCurrentPlan } from "../api/planApi";
import { deleteLog, fetchWeekLogs, logMeal, logWorkout } from "../api/logApi";
import { getErrorMessage } from "../api/client";
import { addDaysTo, dayNameOf, formatDate, todayString } from "../utils/format";

const EMPTY_MEAL = { mealName: "", calories: "", proteinG: "", carbsG: "", fatG: "" };

// The number fields in the meal form
const MEAL_FIELDS = [
  { name: "calories", label: "Calories", max: 5000 },
  { name: "proteinG", label: "Protein (g)", max: 400 },
  { name: "carbsG", label: "Carbs (g)", max: 800 },
  { name: "fatG", label: "Fat (g)", max: 300 },
];

export default function Log() {
  const { data: plan, error: planError, loading: planLoading } = useApiData(fetchCurrentPlan, "plan");
  const [version, setVersion] = useState(0);
  const weekStart = plan?.weekStart || "";
  const { data: logs } = useApiData(
    () => (weekStart ? fetchWeekLogs(weekStart) : Promise.resolve([])),
    `${weekStart}|${version}` // reload after every change
  );
  const [chosenDate, setChosenDate] = useState("");
  const [meal, setMeal] = useState(EMPTY_MEAL);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (planLoading) return <p className="page-message">Loading...</p>;
  if (planError) return <p className="alert alert-error">{planError}</p>;

  if (!plan) {
    return (
      <div className="card page-message">
        <h2>Build your plan first</h2>
        <p>Your daily log follows this week's AI plan.</p>
        <Link to="/plan" className="btn btn-primary">
          Go to my plan
        </Link>
      </div>
    );
  }

  // The 7 dates of the plan's week, Monday to Sunday
  const weekDates = Array.from({ length: 7 }, (_, i) => addDaysTo(plan.weekStart, i));
  const today = todayString();
  const date = chosenDate || (weekDates.includes(today) ? today : weekDates[0]);

  const planDay = plan.days.find((d) => d.day === dayNameOf(date));
  const dayLogs = (logs || []).filter((l) => l.date === date);
  const workoutLogs = dayLogs.filter((l) => l.type === "workout");
  const mealLogs = dayLogs.filter((l) => l.type === "meal");
  const total = (field) => mealLogs.reduce((sum, l) => sum + (l[field] || 0), 0);
  const exercises = planDay && !planDay.isRest ? planDay.exercises : [];
  const doneCount = exercises.filter((ex) => workoutLogs.some((l) => l.exerciseId === ex.exerciseId)).length;

  // Run a change, then reload the logs (or show the error)
  async function run(action) {
    setError("");
    setBusy(true);
    try {
      await action();
      setVersion((v) => v + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function toggleExercise(exerciseId) {
    const existing = workoutLogs.find((l) => l.exerciseId === exerciseId);
    run(() => (existing ? deleteLog(existing._id) : logWorkout({ date, exerciseId })));
  }

  function handleMealSubmit(e) {
    e.preventDefault();
    run(async () => {
      await logMeal({ date, ...meal });
      setMeal(EMPTY_MEAL);
    });
  }

  return (
    <>
      <div className="plan-header">
        <div>
          <h1>Daily log</h1>
          <p className="muted">Week of {formatDate(plan.weekStart)}</p>
        </div>
        <Link to="/plan" className="btn btn-outline">
          Plan and check-in
        </Link>
      </div>

      <div className="chip-row" role="group" aria-label="Choose a day">
        {weekDates.map((d) => (
          <button
            key={d}
            type="button"
            className={d === date ? "chip active" : "chip"}
            aria-pressed={d === date}
            onClick={() => setChosenDate(d)}
          >
            {formatDate(d)}
          </button>
        ))}
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="detail-grid">
        <section className="card">
          <div className="day-header">
            <h2>Workout</h2>
            <span className="badge">{exercises.length ? planDay.focus : "Rest"}</span>
          </div>

          {exercises.length === 0 ? (
            <p className="muted">Rest day. Light walking and stretching are fine.</p>
          ) : (
            <>
              <ul className="check-list">
                {exercises.map((ex, index) => {
                  const done = workoutLogs.some((l) => l.exerciseId === ex.exerciseId);
                  return (
                    <li key={`${ex.exerciseId}-${index}`}>
                      <label className="check-item">
                        <input
                          type="checkbox"
                          checked={done}
                          disabled={busy}
                          onChange={() => toggleExercise(ex.exerciseId)}
                        />
                        <span>
                          <strong>{ex.name}</strong>{" "}
                          <span className="muted small">
                            {ex.sets} × {ex.reps}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <p className="muted small">
                {doneCount} of {exercises.length} exercises done
              </p>
            </>
          )}
        </section>

        <section className="card">
          <h2>Meals</h2>
          <div className="stat-grid">
            <Total value={total("calories")} target={plan.nutrition.calories} unit="kcal" label="" />
            <Total value={total("proteinG")} target={plan.nutrition.proteinG} unit="g" label="protein" />
            <Total value={total("carbsG")} target={plan.nutrition.carbsG} unit="g" label="carbs" />
            <Total value={total("fatG")} target={plan.nutrition.fatG} unit="g" label="fat" />
          </div>

          {mealLogs.length > 0 && (
            <ul className="meal-list">
              {mealLogs.map((m) => (
                <li key={m._id}>
                  <span>
                    <strong>{m.mealName}</strong>{" "}
                    <span className="muted small">
                      {m.calories} kcal · {m.proteinG} g protein · {m.carbsG || 0} g carbs · {m.fatG || 0} g fat
                    </span>
                  </span>
                  <button
                    className="btn btn-outline btn-small"
                    disabled={busy}
                    onClick={() => run(() => deleteLog(m._id))}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form className="meal-form" onSubmit={handleMealSubmit}>
            <label>
              Meal
              <input
                value={meal.mealName}
                onChange={(e) => setMeal({ ...meal, mealName: e.target.value })}
                placeholder="e.g. Chicken and rice"
                required
              />
            </label>
            {MEAL_FIELDS.map((field) => (
              <label key={field.name}>
                {field.label}
                <input
                  type="number"
                  min="0"
                  max={field.max}
                  value={meal[field.name]}
                  onChange={(e) => setMeal({ ...meal, [field.name]: e.target.value })}
                />
              </label>
            ))}
            <button className="btn btn-primary" disabled={busy}>
              Add meal
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

// One "eaten vs. target" box in the meals section
function Total({ value, target, unit, label }) {
  return (
    <div className="stat">
      <span className="stat-value">
        {value}
        <span className="stat-unit"> {unit}</span>
      </span>
      <span className="muted small">
        of {target} {unit} {label}
      </span>
    </div>
  );
}