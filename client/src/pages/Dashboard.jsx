import { Link } from "react-router-dom";
import UpcomingBookings from "../components/UpcomingBookings";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user.name.split(" ")[0];
  const isClient = user.role === "client";

  return (
    <>
      <h1 className="dashboard-title">Welcome, {firstName}</h1>
      <p className="muted">
        Signed in as {user.email} ({user.role})
      </p>

      <div className="card-grid">
        {isClient && !user.onboardingComplete && (
          <div className="card">
            <h3>Set up your profile</h3>
            <p className="muted">Answer a few questions so your AI coach can build your plan.</p>
            <Link to="/onboarding" className="btn btn-primary">
              Get started
            </Link>
          </div>
        )}

        <UpcomingBookings />

        {isClient && user.onboardingComplete && (
          <div className="card">
            <h3>This week's plan</h3>
            <p className="muted">Your AI workout and nutrition plan for the week.</p>
            <Link to="/plan" className="btn btn-outline">
              View my plan
            </Link>
          </div>
        )}
      </div>
    </>
  );
}