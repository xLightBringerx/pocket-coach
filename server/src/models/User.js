const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Fitness info collected during onboarding (filled in later)
const profileSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 13, max: 100 },
    heightCm: { type: Number, min: 100, max: 250 },
    weightKg: { type: Number, min: 30, max: 300 },
    experience: { type: String, enum: ["none", "beginner", "intermediate", "advanced"] },
    goal: { type: String, enum: ["bodybuilding", "athletic", "lifestyle", "weight-loss"] },
    daysPerWeek: { type: Number, min: 1, max: 7 },
    dietPref: { type: String, enum: ["none", "vegetarian", "vegan", "keto", "other"], default: "none" },
    // Which units the user prefers to see; values are always stored in cm and kg
    units: { type: String, enum: ["imperial", "metric"], default: "imperial" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select: false means the password is never returned unless we ask for it
    password: { type: String, required: [true, "Password is required"], minlength: 8, select: false },
    role: { type: String, enum: ["client", "trainer", "admin"], default: "client" },
    profile: profileSchema,
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// Before saving, hash the password if it's new or changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Check a typed-in password against the stored hash
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);