const logService = require("../services/logService");

async function getWeekLogs(req, res, next) {
  try {
    const logs = await logService.listWeekLogs(req.user._id, req.query.weekStart);
    res.json({ logs });
  } catch (error) {
    next(error);
  }
}

async function addWorkout(req, res, next) {
  try {
    const log = await logService.logWorkout(req.user._id, req.body);
    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
}

async function addMeal(req, res, next) {
  try {
    const log = await logService.logMeal(req.user._id, req.body);
    res.status(201).json({ log });
  } catch (error) {
    next(error);
  }
}

async function removeLog(req, res, next) {
  try {
    await logService.deleteLog(req.user._id, req.params.id);
    res.json({ message: "Log entry removed" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getWeekLogs, addWorkout, addMeal, removeLog };