const trainingService = require("../services/trainingService");

async function getServices(req, res, next) {
  try {
    const { category, goal } = req.query;
    const services = await trainingService.listServices({ category, goal });
    res.json({ services });
  } catch (error) {
    next(error);
  }
}

async function getService(req, res, next) {
  try {
    const service = await trainingService.getServiceById(req.params.id);
    res.json({ service });
  } catch (error) {
    next(error);
  }
}

async function getMyServices(req, res, next) {
  try {
    const services = await trainingService.listMyServices(req.user._id);
    res.json({ services });
  } catch (error) {
    next(error);
  }
}

async function createService(req, res, next) {
  try {
    const service = await trainingService.createService(req.user._id, req.body);
    res.status(201).json({ service });
  } catch (error) {
    next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await trainingService.updateService(req.user._id, req.params.id, req.body);
    res.json({ service });
  } catch (error) {
    next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    await trainingService.deleteService(req.user._id, req.params.id);
    res.json({ message: "Service removed" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getServices, getService, getMyServices, createService, updateService, deleteService };