const bookingService = require("../services/bookingService");
const AppError = require("../utils/AppError");

async function getSlots(req, res, next) {
  try {
    const { serviceId, date, excludeBooking } = req.query;
    if (!serviceId) throw new AppError("serviceId is required", 400);
    const slots = await bookingService.getAvailableSlots(serviceId, date, excludeBooking || null);
    res.json({ date, slots });
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.listMyBookings(req.user);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const booking = await bookingService.cancelBooking(req.user, req.params.id);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

async function rescheduleBooking(req, res, next) {
  try {
    const booking = await bookingService.rescheduleBooking(req.user, req.params.id, req.body);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const booking = await bookingService.updateBookingStatus(req.user, req.params.id, req.body.status);
    res.json({ booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
};