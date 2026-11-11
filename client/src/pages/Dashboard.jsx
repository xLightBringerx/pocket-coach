import UpcomingBookings from "../components/UpcomingBookings";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <h1 className="dashboard-title">Welcome, {firstName}</h1>
      <p className="muted">
        Signed in as {user.email} ({user.role})
      </p>

      <div className="card-grid">
        {user.role === "client" && !user.onboardingComplete && (
          <div className="card">
            <h3>Set up your profile</h3>
            <p className="muted">Onboarding is coming soon. It's what builds your AI plan.</p>
          </div>
        )}
        <UpcomingBookings />
        <div className="card">
          <h3>This week's plan</h3>
          <p className="muted">Your AI plan will show here.</p>
        </div>
      </div>
    </>
  );
}