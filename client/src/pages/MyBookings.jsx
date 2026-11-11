import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BookingCard from "../components/BookingCard";
import useAuth from "../hooks/useAuth";
import useApiData from "../hooks/useApiData";
import { cancelBooking, fetchMyBookings, updateBookingStatus } from "../api/bookingApi";
import { getErrorMessage } from "../api/client";
import { ACTIVE_STATUSES, todayString } from "../utils/format";

export default function MyBookings() {
  const { user } = useAuth();
  const location = useLocation();
  const [version, setVersion] = useState(0);
  const [tab, setTab] = useState("upcoming");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: bookings, error, loading } = useApiData(fetchMyBookings, `bookings-${version}`);

  // Run a change, then reload the list (or show the error)
  async function runAction(action) {
    setActionError("");
    setBusy(true);
    try {
      await action();
      setVersion((v) => v + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCancel(id) {
    if (!window.confirm("Cancel this booking?")) return;
    runAction(() => cancelBooking(id));
  }

  function handleStatusChange(id, status) {
    runAction(() => updateBookingStatus(id, status));
  }

  const today = todayString();
  const isUpcoming = (b) => ACTIVE_STATUSES.includes(b.status) && b.date >= today;
  const upcoming = (bookings || []).filter(isUpcoming);
  const past = (bookings || []).filter((b) => !isUpcoming(b)).reverse(); // newest first
  const shown = tab === "upcoming" ? upcoming : past;

  return (
    <>
      <h1>{user.role === "trainer" ? "Client bookings" : "My bookings"}</h1>

      {location.state?.message && <p className="alert alert-success">{location.state.message}</p>}
      {actionError && <p className="alert alert-error">{actionError}</p>}

      <div className="chip-row" role="tablist">
        <button className={tab === "upcoming" ? "chip active" : "chip"} onClick={() => setTab("upcoming")}>
          Upcoming ({upcoming.length})
        </button>
        <button className={tab === "past" ? "chip active" : "chip"} onClick={() => setTab("past")}>
          Past and cancelled ({past.length})
        </button>
      </div>

      {loading && <p className="page-message">Loading bookings...</p>}
      {error && <p className="alert alert-error">{error}</p>}

      {!loading && !error && shown.length === 0 && (
        <p className="page-message">
          Nothing here yet.{" "}
          {user.role === "client" && <Link to="/trainers">Find a trainer to book</Link>}
        </p>
      )}

      {!loading && !error && shown.length > 0 && (
        <div className="stack">
          {shown.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              role={user.role}
              busy={busy}
              onCancel={handleCancel}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </>
  );
}