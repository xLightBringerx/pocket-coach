import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { saveProfile } from "../api/profileApi";
import { getErrorMessage } from "../api/client";
import { DIET_OPTIONS, EXPERIENCE_OPTIONS, GOALS, GOAL_LABELS } from "../utils/format";

const EMPTY_FORM = {
  units: "imperial",
  age: "",
  heightFt: "",
  heightIn: "",
  heightCm: "",
  weightLbs: "",
  weightKg: "",
  experience: "",
  goal: "",
  daysPerWeek: "3",
  dietPref: "none",
};

// When editing, fill the form from the saved profile (stored in cm and kg)
function formFromProfile(profile) {
  if (!profile) return EMPTY_FORM;
  const totalInches = Math.round(profile.heightCm / 2.54);
  return {
    units: profile.units || "imperial",
    age: String(profile.age),
    heightFt: String(Math.floor(totalInches / 12)),
    heightIn: String(totalInches % 12),
    heightCm: String(profile.heightCm),
    weightLbs: String(Math.round(profile.weightKg / 0.45359237)),
    weightKg: String(profile.weightKg),
    experience: profile.experience,
    goal: profile.goal,
    daysPerWeek: String(profile.daysPerWeek),
    dietPref: profile.dietPref || "none",
  };
}

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => formFromProfile(user.profile));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isImperial = form.units === "imperial";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const updatedUser = await saveProfile(form);
      updateUser(updatedUser);
      navigate("/plan", { state: { message: "Profile saved! Now let your AI coach build this week's plan." } });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card onboarding-card" onSubmit={handleSubmit}>
        <h1>{user.onboardingComplete ? "Update your profile" : "Tell us about you"}</h1>
        <p className="muted">Your AI coach uses this to build your weekly workout and diet plan.</p>
        {error && <p className="alert alert-error">{error}</p>}

        <fieldset>
          <legend>Units</legend>
          <div className="chip-row">
            <button
              type="button"
              className={isImperial ? "chip active" : "chip"}
              aria-pressed={isImperial}
              onClick={() => setForm({ ...form, units: "imperial" })}
            >
              ft / lbs
            </button>
            <button
              type="button"
              className={!isImperial ? "chip active" : "chip"}
              aria-pressed={!isImperial}
              onClick={() => setForm({ ...form, units: "metric" })}
            >
              cm / kg
            </button>
          </div>
        </fieldset>

        <label>
          Age
          <input type="number" name="age" min="13" max="100" value={form.age} onChange={handleChange} required />
        </label>

        {isImperial ? (
          <div className="form-row">
            <label>
              Height (ft)
              <input type="number" name="heightFt" min="3" max="8" value={form.heightFt} onChange={handleChange} required />
            </label>
            <label>
              Height (in)
              <input type="number" name="heightIn" min="0" max="11" value={form.heightIn} onChange={handleChange} required />
            </label>
          </div>
        ) : (
          <label>
            Height (cm)
            <input type="number" name="heightCm" min="100" max="250" step="0.1" value={form.heightCm} onChange={handleChange} required />
          </label>
        )}

        {isImperial ? (
          <label>
            Weight (lbs)
            <input type="number" name="weightLbs" min="66" max="660" value={form.weightLbs} onChange={handleChange} required />
          </label>
        ) : (
          <label>
            Weight (kg)
            <input type="number" name="weightKg" min="30" max="300" step="0.1" value={form.weightKg} onChange={handleChange} required />
          </label>
        )}

        <label>
          Training experience
          <select name="experience" value={form.experience} onChange={handleChange} required>
            <option value="">Choose one</option>
            {EXPERIENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Main goal
          <select name="goal" value={form.goal} onChange={handleChange} required>
            <option value="">Choose one</option>
            {GOALS.map((goal) => (
              <option key={goal} value={goal}>
                {GOAL_LABELS[goal]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Training days per week
          <select name="daysPerWeek" value={form.daysPerWeek} onChange={handleChange}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>

        <label>
          Diet preference
          <select name="dietPref" value={form.dietPref} onChange={handleChange}>
            {DIET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <p className="muted small">
          PocketCoach gives general fitness guidance, not medical advice. Check with a doctor before starting a new
          program if you have a health condition.
        </p>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Saving..." : "Save and continue"}
        </button>
      </form>
    </div>
  );
}