import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SlotPicker from "../components/SlotPicker";
import useApiData from "../hooks/useApiData";
import { fetchMyBookings, rescheduleBooking } from "../api/bookingApi";
import { getErrorMessage } from "../api/client";
import { formatDate, formatTime } from "../utils/format";

export default function RescheduleBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: bookings, error: loadError, loading } = useApiData(fetchMyBookings, `reschedule-${id}`);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await rescheduleBooking(id, { date, startTime: time });
      navigate("/bookings", {
        state: { message: "Booking moved. It's pending until your trainer confirms the new time." },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="page-message">Loading...</p>;
  if (loadError) return <p className="alert alert-error">{loadError}</p>;

  const booking = bookings.find((b) => b._id === id);
  if (!booking) {
    return (
      <p className="page-message">
        Booking not found. <Link to="/bookings">Back to bookings</Link>
      </p>
    );
  }

  return (
    <>
      <Link to="/bookings" className="back-link">
        ← My bookings
      </Link>

      <form className="card booking-form" onSubmit={handleSubmit}>
        <h1>Reschedule</h1>
        <p className="muted">
          {booking.service.title} with {booking.trainer.user.name}. Currently {formatDate(booking.date)} at{" "}
          {formatTime(booking.startTime)}.
        </p>
        {error && <p className="alert alert-error">{error}</p>}

        <SlotPicker
          serviceId={booking.service._id}
          excludeBooking={booking._id}
          date={date}
          onDateChange={setDate}
          selectedTime={time}
          onTimeChange={setTime}
        />

        <button className="btn btn-primary btn-block" disabled={submitting || !time}>
          {submitting ? "Saving..." : "Move booking"}
        </button>
      </form>
    </>
  );
}