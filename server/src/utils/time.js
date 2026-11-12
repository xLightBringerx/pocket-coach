const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/; // "2026-11-30"
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/; // "09:30"

// "09:30" -> 570 (minutes since midnight), so times are easy to compare and add
function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// 570 -> "09:30"
function toTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// "2026-11-30" -> 1 (Monday). 0 = Sunday ... 6 = Saturday, same as availability
function dayOfWeek(date) {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

// Date + time -> a real Date object (in the server's time zone)
function startDateTime(date, time) {
  return new Date(`${date}T${time}:00`);
}

// ("2026-11-09", 6) -> "2026-11-15"
function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

module.exports = { DATE_PATTERN, TIME_PATTERN, toMinutes, toTime, dayOfWeek, startDateTime, addDays };