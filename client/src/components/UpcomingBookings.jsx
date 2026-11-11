import { Link } from "react-router-dom";
import useApiData from "../hooks/useApiData";
import { fetchMyBookings } from "../api/bookingApi";
import { ACTIVE_STATUSES, formatDate, formatTime, todayString } from "../utils/format";

export default function UpcomingBookings() {
  const { data: bookings, error, loading } = useApiData(fetchMyBookings, "upcoming");
  const today = todayString();
  const upcoming = (bookings || [])
    .filter((b) => ACTIVE_STATUSES.includes(b.status) && b.date >= today)
    .slice(0, 3); // next 3 only

  return (
    <div className="card">
      <h3>Upcoming sessions</h3>
      {loading && <p className="muted">Loading...</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && upcoming.length === 0 && <p className="muted">No upcoming sessions.</p>}

      {!loading && !error && upcoming.length > 0 && (
        <ul className="upcoming-list">
          {upcoming.map((b) => (
            <li key={b._id}>
              <strong>
                {formatDate(b.date)}, {formatTime(b.startTime)}
              </strong>
              <span className="muted small">{b.service?.title}</span>
            </li>
          ))}
        </ul>
      )}

      <Link to="/bookings" className="small">
        View all bookings →
      </Link>
    </div>
  );
}