const Service = require("../models/Service");
const TrainerProfile = require("../models/TrainerProfile");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");

// Fields a trainer can set; "trainer" always comes from the logged-in user instead
const EDITABLE_FIELDS = ["title", "description", "category", "durationMin", "price", "goals", "isActive"];

function pickEditable(data) {
  const picked = {};
  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) picked[field] = data[field];
  }
  return picked;
}

async function ensureCategoryExists(categoryId) {
  if (categoryId && !(await Category.exists({ _id: categoryId }))) {
    throw new AppError("Category not found", 400);
  }
}

async function getProfileOrFail(userId) {
  const profile = await TrainerProfile.findOne({ user: userId });
  if (!profile) throw new AppError("Create your trainer profile before adding services", 400);
  return profile;
}

// Public list: only active services from approved trainers
async function listServices({ category, goal } = {}) {
  const approved = await TrainerProfile.find({ approved: true }).select("_id");
  const filter = { isActive: true, trainer: { $in: approved.map((t) => t._id) } };
  if (category) filter.category = category;
  if (goal) filter.goals = goal;

  return Service.find(filter)
    .populate("category", "name")
    .populate({ path: "trainer", select: "user location", populate: { path: "user", select: "name" } })
    .sort({ createdAt: -1 });
}

async function getServiceById(id) {
  const service = await Service.findOne({ _id: id, isActive: true })
    .populate("category", "name")
    .populate({ path: "trainer", populate: { path: "user", select: "name" } });
  if (!service || !service.trainer || !service.trainer.approved) {
    throw new AppError("Service not found", 404);
  }
  return service;
}

async function listMyServices(userId) {
  const profile = await getProfileOrFail(userId);
  return Service.find({ trainer: profile._id }).populate("category", "name").sort({ createdAt: -1 });
}

async function createService(userId, data) {
  const profile = await getProfileOrFail(userId);
  await ensureCategoryExists(data.category);
  return Service.create({ ...pickEditable(data), trainer: profile._id });
}

// Loads a service and checks the logged-in trainer owns it
async function getOwnedService(userId, serviceId) {
  const profile = await getProfileOrFail(userId);
  const service = await Service.findById(serviceId);
  if (!service) throw new AppError("Service not found", 404);
  if (!service.trainer.equals(profile._id)) {
    throw new AppError("You can only change your own services", 403);
  }
  return service;
}

async function updateService(userId, serviceId, data) {
  const service = await getOwnedService(userId, serviceId);
  await ensureCategoryExists(data.category);
  Object.assign(service, pickEditable(data));
  return service.save(); // save() runs the schema validators
}

// Soft delete: hide it instead of erasing it
async function deleteService(userId, serviceId) {
  const service = await getOwnedService(userId, serviceId);
  service.isActive = false;
  await service.save();
}

module.exports = {
  listServices,
  getServiceById,
  listMyServices,
  createService,
  updateService,
  deleteService,
};