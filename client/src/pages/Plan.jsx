import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useApiData from "../hooks/useApiData";
import { fetchCurrentPlan, generatePlan } from "../api/planApi";
import { getErrorMessage } from "../api/client";
import { formatDate } from "../utils/format";

export default function Plan() {
  const { user } = useAuth();
  const location = useLocation();
  const [version, setVersion] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const { data: plan, error, loading } = useApiData(fetchCurrentPlan, `plan-${version}`);

  async function handleGenerate() {
    if (plan && !window.confirm("Replace this week's plan with a new one?")) return;
    setGenerateError("");
    setGenerating(true);
    try {
      await generatePlan();
      setVersion((v) => v + 1); // reload the plan
    } catch (err) {
      setGenerateError(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  }

  if (!user.onboardingComplete) {
    return (
      <div className="card page-message">
        <h2>Finish your profile first</h2>
        <p>Your AI coach needs a few details before it can build your plan.</p>
        <Link to="/onboarding" className="btn btn-primary">
          Set up my profile
        </Link>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="page-message">
        <div className="spinner" aria-hidden="true" />
        <h2>Your AI coach is building your plan...</h2>
        <p>This usually takes 20 to 60 seconds.</p>
      </div>
    );
  }

  if (loading) return <p className="page-message">Loading your plan...</p>;
  if (error) return <p className="alert alert-error">{error}</p>;

  return (
    <>
      <div className="plan-header">
        <div>
          <h1>This week's plan</h1>
          {plan && <p className="muted">Week of {formatDate(plan.weekStart)} · built by your AI coach</p>}
        </div>
        {plan && (
          <div className="hero-actions">
            <Link to="/onboarding" className="btn btn-outline">
              Edit profile
            </Link>
            <button className="btn btn-outline" onClick={handleGenerate}>
              Regenerate
            </button>
          </div>
        )}
      </div>

      {location.state?.message && <p className="alert alert-success">{location.state.message}</p>}
      {generateError && <p className="alert alert-error">{generateError}</p>}

      {!plan ? (
        <div className="card page-message">
          <h2>No plan yet</h2>
          <p>Your AI coach will build a 7-day workout and nutrition plan from your profile.</p>
          <button className="btn btn-primary" onClick={handleGenerate}>
            Build my plan
          </button>
        </div>
      ) : (
        <>
          <section className="card plan-section">
            <h2>Coach's notes</h2>
            <p>{plan.summary}</p>
          </section>

          <section className="card plan-section">
            <h2>Daily nutrition targets</h2>
            <div className="stat-grid">
              <Stat label="Calories" value={plan.nutrition.calories} unit="kcal" />
              <Stat label="Protein" value={plan.nutrition.proteinG} unit="g" />
              <Stat label="Carbs" value={plan.nutrition.carbsG} unit="g" />
              <Stat label="Fat" value={plan.nutrition.fatG} unit="g" />
            </div>

            {plan.nutrition.tips.length > 0 && (
              <>
                <h3>Tips</h3>
                <ul>
                  {plan.nutrition.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </>
            )}

            {plan.nutrition.sampleMeals.length > 0 && (
              <>
                <h3>Sample meals</h3>
                <ul>
                  {plan.nutrition.sampleMeals.map((m) => (
                    <li key={m.meal + m.description}>
                      <strong>{m.meal}:</strong> {m.description}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <h2 className="section-title">Workouts</h2>
          <div className="stack">
            {plan.days.map((day) => (
              <section key={day.day} className={day.isRest ? "card day-card rest-day" : "card day-card"}>
                <div className="day-header">
                  <h3>{day.day}</h3>
                  <span className="badge">{day.isRest ? "Rest" : day.focus}</span>
                </div>

                {day.isRest || day.exercises.length === 0 ? (
                  <p className="muted">Rest day. Light walking and stretching are fine.</p>
                ) : (
                  <ul className="exercise-list">
                    {day.exercises.map((ex, index) => (
                      <li key={`${ex.exerciseId}-${index}`}>
                        <div>
                          <strong>{ex.name}</strong>
                          {ex.notes && <p className="muted small">{ex.notes}</p>}
                        </div>
                        <span className="exercise-sets">
                          {ex.sets} × {ex.reps}
                        </span>
                        <span className="muted small">{ex.restSec}s rest</span>
                        <a href={ex.demoUrl} target="_blank" rel="noreferrer" className="small">
                          Watch demo ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <p className="muted small">
            General fitness guidance, not medical advice. Stop any exercise that causes pain.
          </p>
        </>
      )}
    </>
  );
}

// One number box in the nutrition section
function Stat({ label, value, unit }) {
  return (
    <div className="stat">
      <span className="stat-value">
        {value}
        <span className="stat-unit"> {unit}</span>
      </span>
      <span className="muted small">{label}</span>
    </div>
  );
}