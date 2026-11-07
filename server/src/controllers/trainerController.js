const trainerService = require("../services/trainerService");

async function getTrainers(req, res, next) {
  try {
    const trainers = await trainerService.listTrainers({ goal: req.query.goal });
    res.json({ trainers });
  } catch (error) {
    next(error);
  }
}

async function getTrainer(req, res, next) {
  try {
    const result = await trainerService.getTrainerById(req.params.id);
    res.json(result); // { trainer, services }
  } catch (error) {
    next(error);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const profile = await trainerService.getMyProfile(req.user._id);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await trainerService.upsertMyProfile(req.user._id, req.body);
    res.json({ profile });
  } catch (error) {
    next(error);
  }
}

module.exports = { getTrainers, getTrainer, getMyProfile, updateMyProfile };