import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const FEATURES = [
  {
    title: "Book local trainers",
    text: "Browse trainers by goal, compare their services and book a session that fits your schedule.",
  },
  {
    title: "Your AI weekly plan",
    text: "Get a workout and diet plan built from your goals, experience and body stats.",
  },
  {
    title: "Stay on track",
    text: "Log meals and workouts, and get weekly adjustments based on what you actually did.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <section className="hero">
        <h1>Your personal trainer, in your pocket</h1>
        <p>Book real local trainers and follow a weekly plan that adapts to how your training is going.</p>
        <div className="hero-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary">
              Get started
            </Link>
          )}
          <Link to="/trainers" className="btn btn-outline">
            Find a trainer
          </Link>
        </div>
      </section>

      <section className="card-grid">
        {FEATURES.map((feature) => (
          <div className="card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p className="muted">{feature.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}