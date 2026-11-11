import api from "./client";

export async function fetchSlots(serviceId, date, excludeBooking) {
  const params = { serviceId, date };
  if (excludeBooking) params.excludeBooking = excludeBooking;
  const res = await api.get("/bookings/slots", { params });
  return res.data.slots;
}

export async function createBooking(data) {
  const res = await api.post("/bookings", data);
  return res.data.booking;
}

export async function fetchMyBookings() {
  const res = await api.get("/bookings/mine");
  return res.data.bookings;
}

export async function cancelBooking(id) {
  const res = await api.patch(`/bookings/${id}/cancel`);
  return res.data.booking;
}

export async function rescheduleBooking(id, data) {
  const res = await api.patch(`/bookings/${id}/reschedule`, data);
  return res.data.booking;
}

export async function updateBookingStatus(id, status) {
  const res = await api.patch(`/bookings/${id}/status`, { status });
  return res.data.booking;
}