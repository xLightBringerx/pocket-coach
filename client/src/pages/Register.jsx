import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Quick checks in the browser; the API checks again
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        {error && <p className="alert alert-error">{error}</p>}

        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </label>

        <label>
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </label>

        <fieldset>
          <legend>I am a...</legend>
          <div className="role-options">
            <label className="role-option">
              <input type="radio" name="role" value="client" checked={form.role === "client"} onChange={handleChange} />
              Client
            </label>
            <label className="role-option">
              <input type="radio" name="role" value="trainer" checked={form.role === "trainer"} onChange={handleChange} />
              Trainer
            </label>
          </div>
        </fieldset>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>

        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}