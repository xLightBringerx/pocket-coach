import { Link } from "react-router-dom";
import { ACTIVE_STATUSES, STATUS_LABELS, formatDate, formatPrice, formatTime, hoursUntil } from "../utils/format";

export default function BookingCard({ booking, role, busy, onCancel, onStatusChange }) {
  const isActive = ACTIVE_STATUSES.includes(booking.status);
  const clientCanChange = role === "client" && isActive && hoursUntil(booking.date, booking.startTime) > 24;
  const otherPerson = role === "trainer" ? booking.client?.name : booking.trainer?.user?.name;

  return (
    <div className="card booking-card">
      <div>
        <span className={`status status-${booking.status}`}>{STATUS_LABELS[booking.status]}</span>
        <h3>{booking.service?.title}</h3>
        <p className="muted small">
          {role === "trainer" ? "Client" : "Trainer"}: {otherPerson}
        </p>
        <p>
          <strong>{formatDate(booking.date)}</strong> · {formatTime(booking.startTime)} –{" "}
          {formatTime(booking.endTime)} · {formatPrice(booking.price)}
        </p>
        {booking.notes && <p className="muted small">Note: {booking.notes}</p>}
      </div>

      <div className="booking-actions">
        {clientCanChange && (
          <>
            <Link to={`/bookings/${booking._id}/reschedule`} className="btn btn-outline">
              Reschedule
            </Link>
            <button className="btn btn-outline" disabled={busy} onClick={() => onCancel(booking._id)}>
              Cancel
            </button>
          </>
        )}

        {role === "client" && isActive && !clientCanChange && (
          <p className="muted small">Changes close 24 hours before the session.</p>
        )}

        {role === "trainer" && booking.status === "pending" && (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={() => onStatusChange(booking._id, "confirmed")}>
              Confirm
            </button>
            <button className="btn btn-outline" disabled={busy} onClick={() => onStatusChange(booking._id, "declined")}>
              Decline
            </button>
          </>
        )}

        {role === "trainer" && booking.status === "confirmed" && (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={() => onStatusChange(booking._id, "completed")}>
              Mark completed
            </button>
            <button className="btn btn-outline" disabled={busy} onClick={() => onCancel(booking._id)}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}