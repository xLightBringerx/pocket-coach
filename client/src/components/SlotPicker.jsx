import useApiData from "../hooks/useApiData";
import { fetchSlots } from "../api/bookingApi";
import { formatTime, todayString } from "../utils/format";

export default function SlotPicker({ serviceId, excludeBooking = "", date, onDateChange, selectedTime, onTimeChange }) {
  const { data: slots, error, loading } = useApiData(
    () => (date ? fetchSlots(serviceId, date, excludeBooking) : Promise.resolve([])),
    `${serviceId}|${date}|${excludeBooking}`
  );

  function handleDateChange(e) {
    onDateChange(e.target.value);
    onTimeChange(""); // a new date clears the chosen time
  }

  return (
    <div className="slot-picker">
      <label>
        Date
        <input type="date" value={date} min={todayString()} onChange={handleDateChange} required />
      </label>

      {date && (
        <div>
          <p className="label-text">Available times</p>
          {loading && <p className="muted">Loading times...</p>}
          {error && <p className="alert alert-error">{error}</p>}
          {!loading && !error && slots.length === 0 && (
            <p className="muted">No open times that day. Try another date.</p>
          )}
          {!loading && !error && slots.length > 0 && (
            <div className="slot-grid">
              {slots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={time === selectedTime ? "chip active" : "chip"}
                  aria-pressed={time === selectedTime}
                  onClick={() => onTimeChange(time)}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}