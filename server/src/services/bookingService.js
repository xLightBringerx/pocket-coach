const Booking = require("../models/Booking");
const Service = require("../models/Service");
const TrainerProfile = require("../models/TrainerProfile");
const AppError = require("../utils/AppError");
const { DATE_PATTERN, TIME_PATTERN, toMinutes, toTime, dayOfWeek, startDateTime } = require("../utils/time");

const SLOT_STEP_MIN = 30; // offer a start time every 30 minutes
const ACTIVE_STATUSES = ["pending", "confirmed"]; // these block a time slot
const CHANGE_CUTOFF_HOURS = 24; // clients can't change a booking inside this window

// Which status a trainer may move a booking to, from each status
const TRAINER_TRANSITIONS = {
  pending: ["confirmed", "declined"],
  confirmed: ["completed"],
};

function hoursUntil(booking) {
  return (startDateTime(booking.date, booking.startTime) - new Date()) / (1000 * 60 * 60);
}

async function loadBookableService(serviceId) {
  const service = await Service.findOne({ _id: serviceId, isActive: true }).populate("trainer");
  if (!service || !service.trainer || !service.trainer.approved) {
    throw new AppError("Service not found", 404);
  }
  return service;
}

// Open start times for a service on one date, e.g. ["09:00", "09:30", ...]
// ignoreBookingId lets a booking being rescheduled not block its own time
async function getAvailableSlots(serviceId, date, ignoreBookingId = null) {
  if (!DATE_PATTERN.test(date || "")) {
    throw new AppError("Date must look like 2026-11-30", 400);
  }

  const service = await loadBookableService(serviceId);
  const trainer = service.trainer;
  const blocks = trainer.availability.filter((block) => block.day === dayOfWeek(date));
  if (blocks.length === 0) return []; // trainer doesn't work that day

  const filter = { trainer: trainer._id, date, status: { $in: ACTIVE_STATUSES } };
  if (ignoreBookingId) filter._id = { $ne: ignoreBookingId };
  const taken = await Booking.find(filter);

  const now = new Date();
  const slots = [];

  for (const block of blocks) {
    const blockEnd = toMinutes(block.end);
    // Try each start time while the whole session still fits in the block
    for (let start = toMinutes(block.start); start + service.durationMin <= blockEnd; start += SLOT_STEP_MIN) {
      const end = start + service.durationMin;
      // Two time ranges overlap if each one starts before the other ends
      const overlaps = taken.some((b) => start < toMinutes(b.endTime) && end > toMinutes(b.startTime));
      const inPast = startDateTime(date, toTime(start)) <= now;
      if (!overlaps && !inPast) slots.push(toTime(start));
    }
  }

  return slots;
}

async function createBooking(clientId, { serviceId, date, startTime, notes = "" }) {
  if (!serviceId || !date || !startTime) {
    throw new AppError("Service, date and time are required", 400);
  }
  if (!TIME_PATTERN.test(startTime)) throw new AppError("Time must look like 09:30", 400);

  // Re-check availability right before saving
  const openSlots = await getAvailableSlots(serviceId, date);
  if (!openSlots.includes(startTime)) {
    throw new AppError("That time is no longer available. Please pick another.", 409);
  }

  const service = await Service.findById(serviceId);
  return Booking.create({
    client: clientId,
    trainer: service.trainer,
    service: service._id,
    date,
    startTime,
    endTime: toTime(toMinutes(startTime) + service.durationMin),
    durationMin: service.durationMin,
    price: service.price,
    notes,
  });
}

// Clients see bookings they made; trainers see bookings made with them
async function listMyBookings(user) {
  let filter;
  if (user.role === "trainer") {
    const profile = await TrainerProfile.findOne({ user: user._id });
    if (!profile) return [];
    filter = { trainer: profile._id };
  } else {
    filter = { client: user._id };
  }

  return Booking.find(filter)
    .populate("service", "title")
    .populate("client", "name email photo")
    .populate({ path: "trainer", select: "user location", populate: { path: "user", select: "name photo" } })
    .sort({ date: 1, startTime: 1 });
}

// Loads a booking and works out how this user is connected to it
async function loadBookingForUser(user, bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);

  const isClient = booking.client.equals(user._id);
  let isTrainer = false;
  if (user.role === "trainer") {
    const profile = await TrainerProfile.findOne({ user: user._id });
    isTrainer = Boolean(profile && booking.trainer.equals(profile._id));
  }

  // Same message as "not found" so people can't probe other users' bookings
  if (!isClient && !isTrainer) throw new AppError("Booking not found", 404);
  return { booking, isClient, isTrainer };
}

function ensureActive(booking) {
  if (!ACTIVE_STATUSES.includes(booking.status)) {
    throw new AppError(`This booking is already ${booking.status}`, 400);
  }
}

function ensureOutsideCutoff(booking) {
  if (hoursUntil(booking) < CHANGE_CUTOFF_HOURS) {
    throw new AppError("Bookings can only be changed more than 24 hours before the session", 400);
  }
}

// Clients: only more than 24 hours ahead. Trainers: any time.
async function cancelBooking(user, bookingId) {
  const { booking, isClient } = await loadBookingForUser(user, bookingId);
  ensureActive(booking);
  if (isClient) ensureOutsideCutoff(booking);

  booking.status = "cancelled";
  return booking.save();
}

async function rescheduleBooking(user, bookingId, { date, startTime }) {
  const { booking, isClient } = await loadBookingForUser(user, bookingId);
  if (!isClient) throw new AppError("Only the client can reschedule a booking", 403);
  ensureActive(booking);
  ensureOutsideCutoff(booking);

  const openSlots = await getAvailableSlots(booking.service, date, booking._id);
  if (!openSlots.includes(startTime)) {
    throw new AppError("That time is no longer available. Please pick another.", 409);
  }

  booking.date = date;
  booking.startTime = startTime;
  booking.endTime = toTime(toMinutes(startTime) + booking.durationMin);
  booking.status = "pending"; // the trainer confirms the new time
  return booking.save();
}

async function updateBookingStatus(user, bookingId, newStatus) {
  const { booking, isTrainer } = await loadBookingForUser(user, bookingId);
  if (!isTrainer) throw new AppError("Only the trainer can do this", 403);

  const allowed = TRAINER_TRANSITIONS[booking.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(`A ${booking.status} booking can't be changed to ${newStatus}`, 400);
  }

  booking.status = newStatus;
  return booking.save();
}

module.exports = {
  getAvailableSlots,
  createBooking,
  listMyBookings,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
};