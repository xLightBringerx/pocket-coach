import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../api/client";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      // Go back to the page they were trying to reach, or the dashboard
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        {error && <p className="alert alert-error">{error}</p>}

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </label>

        <PasswordInput
          label="Password"
          name="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
        />

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}