const TrainerProfile = require("../models/TrainerProfile");
const Service = require("../models/Service");
const AppError = require("../utils/AppError");

// Fields a trainer is allowed to change on their own profile (not "approved")
const EDITABLE_FIELDS = ["bio", "specialties", "yearsExperience", "location", "photoUrl", "availability"];

function listTrainers({ goal } = {}) {
  const filter = { approved: true };
  if (goal) filter.specialties = goal; // matches if goal is in the specialties array
  return TrainerProfile.find(filter).populate("user", "name photo").sort({ createdAt: -1 });
}

async function getTrainerById(id) {
  const trainer = await TrainerProfile.findOne({ _id: id, approved: true }).populate("user", "name photo");
  if (!trainer) throw new AppError("Trainer not found", 404);

  const services = await Service.find({ trainer: trainer._id, isActive: true }).populate("category", "name");
  return { trainer, services };
}

async function getMyProfile(userId) {
  const profile = await TrainerProfile.findOne({ user: userId });
  if (!profile) throw new AppError("You haven't created a trainer profile yet", 404);
  return profile;
}

// Creates the profile the first time, updates it after that ("upsert")
function upsertMyProfile(userId, data) {
  const updates = {};
  for (const field of EDITABLE_FIELDS) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  return TrainerProfile.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { returnDocument: "after", upsert: true, runValidators: true }
  );
}

module.exports = { listTrainers, getTrainerById, getMyProfile, upsertMyProfile };