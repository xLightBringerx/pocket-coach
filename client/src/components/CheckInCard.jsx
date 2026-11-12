import { useState } from "react";
import { runCheckIn } from "../api/planApi";
import { getErrorMessage } from "../api/client";

export default function CheckInCard({ plan, onUpdated }) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const checkIn = plan.checkIn;

  async function handleCheckIn() {
    setError("");
    setRunning(true);
    try {
      await runCheckIn();
      onUpdated(); // reload the plan so the new check-in shows
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="card plan-section">
      <div className="day-header">
        <h2>Weekly check-in</h2>
        <button className="btn btn-primary" onClick={handleCheckIn} disabled={running}>
          {running ? "Checking in..." : checkIn ? "Run it again" : "Run my check-in"}
        </button>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {running && <p className="muted">Your AI coach is reviewing your week. This takes 10 to 30 seconds.</p>}

      {!checkIn ? (
        <p className="muted">
          Log your workouts and meals during the week, then run a check-in. Your coach reviews
          how it went and suggests changes for next week's plan.
        </p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-value">
                {checkIn.workoutsDone}/{checkIn.workoutsPlanned}
              </span>
              <span className="muted small">Workout days</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {checkIn.exercisesDone}/{checkIn.exercisesPlanned}
              </span>
              <span className="muted small">Exercises</span>
            </div>
            <div className="stat">
              <span className="stat-value">{checkIn.mealDaysLogged}/7</span>
              <span className="muted small">Days with meals</span>
            </div>
            <div className="stat">
              <span className="stat-value">{checkIn.avgCalories || "-"}</span>
              <span className="muted small">Avg kcal per day</span>
            </div>
          </div>

          <p>{checkIn.summary}</p>

          <h3>Changes for next week</h3>
          <ul>
            {checkIn.adjustments.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <p className="muted small">Your next plan will include these adjustments automatically.</p>
        </>
      )}
    </section>
  );
}