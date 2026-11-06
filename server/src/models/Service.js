const mongoose = require("mongoose");
const { GOALS } = require("../utils/constants");

const serviceSchema = new mongoose.Schema(
  {
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "TrainerProfile", required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 100 },
    description: { type: String, required: [true, "Description is required"], trim: true, maxlength: 2000 },
    durationMin: { type: Number, required: [true, "Duration is required"], min: 15, max: 240 },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    goals: [{ type: String, enum: GOALS }], // which client goals this service fits
    // "Deleting" a service just hides it, so old bookings still point to something
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);