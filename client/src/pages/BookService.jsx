import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SlotPicker from "../components/SlotPicker";
import useApiData from "../hooks/useApiData";
import { fetchService } from "../api/catalogApi";
import { createBooking } from "../api/bookingApi";
import { getErrorMessage } from "../api/client";
import { formatDuration, formatPrice } from "../utils/format";

export default function BookService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { data: service, error: loadError, loading } = useApiData(() => fetchService(serviceId), serviceId);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!date || !time) {
      setError("Pick a date and a time");
      return;
    }
    setSubmitting(true);
    try {
      await createBooking({ serviceId, date, startTime: time, notes });
      navigate("/bookings", {
        state: { message: "Booking requested! Your trainer will confirm it soon." },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="page-message">Loading...</p>;
  if (loadError) return <p className="alert alert-error">{loadError}</p>;

  return (
    <>
      <Link to={`/services/${service._id}`} className="back-link">
        ← {service.title}
      </Link>

      <div className="detail-grid">
        <form className="card booking-form" onSubmit={handleSubmit}>
          <h1>Book a session</h1>
          {error && <p className="alert alert-error">{error}</p>}

          <SlotPicker
            serviceId={service._id}
            date={date}
            onDateChange={setDate}
            selectedTime={time}
            onTimeChange={setTime}
          />

          <label>
            Notes for your trainer (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Injuries, goals for this session, anything they should know"
            />
          </label>

          <button className="btn btn-primary btn-block" disabled={submitting || !time}>
            {submitting ? "Booking..." : "Request booking"}
          </button>
        </form>

        <aside className="card booking-box">
          <h3>{service.title}</h3>
          <p className="muted">with {service.trainer.user.name}</p>
          <p className="price">{formatPrice(service.price)}</p>
          <p className="muted">
            {formatDuration(service.durationMin)} · {service.trainer.location}
          </p>
          <p className="muted small">
            Your trainer confirms the booking. You can change or cancel it up to 24 hours before.
          </p>
        </aside>
      </div>
    </>
  );
}