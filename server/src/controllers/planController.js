const planService = require("../services/planService");

async function generate(req, res, next) {
  try {
    const plan = await planService.generatePlan(req.user);
    res.status(201).json({ plan });
  } catch (error) {
    next(error);
  }
}

async function getCurrent(req, res, next) {
  try {
    const plan = await planService.getLatestPlan(req.user._id);
    res.json({ plan }); // plan is null if there isn't one yet
  } catch (error) {
    next(error);
  }
}

async function checkIn(req, res, next) {
  try {
    const plan = await planService.runCheckIn(req.user);
    res.json({ plan });
  } catch (error) {
    next(error);
  }
}

module.exports = { generate, getCurrent, checkIn };