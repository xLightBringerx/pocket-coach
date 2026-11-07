require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Category = require("../models/Category");
const TrainerProfile = require("../models/TrainerProfile");
const Service = require("../models/Service");

const SEED_PASSWORD = "password123";
const ADMIN_EMAIL = "admin@pocketcoach.test";

// Monday (1) to Friday (5), same hours each day
const weekdays = (start, end) => [1, 2, 3, 4, 5].map((day) => ({ day, start, end }));

const categories = [
  { name: "Strength Training", description: "Build muscle and get stronger" },
  { name: "Physique Prep", description: "Bodybuilding and physique competition coaching" },
  { name: "Athletic Performance", description: "Speed, power and sport-specific training" },
  { name: "Weight Loss", description: "Fat loss with sustainable habits" },
  { name: "Nutrition Coaching", description: "Meal planning and macro guidance" },
];

const trainers = [
  {
    name: "Jordan Reyes",
    email: "jordan@pocketcoach.test",
    bio: "Competitive bodybuilder and coach who has prepped clients for their first physique shows.",
    specialties: ["bodybuilding"],
    yearsExperience: 8,
    location: "Downtown Iron Gym",
    availability: weekdays("06:00", "14:00"),
    services: [
      {
        title: "Physique Competition Prep",
        category: "Physique Prep",
        durationMin: 60,
        price: 75,
        goals: ["bodybuilding"],
        description: "Weekly prep session: training review, physique check and adjustments for show day.",
      },
      {
        title: "Posing Practice",
        category: "Physique Prep",
        durationMin: 30,
        price: 40,
        goals: ["bodybuilding"],
        description: "Learn and polish mandatory poses and stage presentation.",
      },
    ],
  },
  {
    name: "Maya Chen",
    email: "maya@pocketcoach.test",
    bio: "Former college sprinter who trains athletes for speed, power and injury resistance.",
    specialties: ["athletic"],
    yearsExperience: 6,
    location: "Eastside Performance Center",
    availability: weekdays("12:00", "20:00"),
    services: [
      {
        title: "Speed and Agility Training",
        category: "Athletic Performance",
        durationMin: 60,
        price: 65,
        goals: ["athletic"],
        description: "Sprint mechanics, footwork drills and plyometrics for field and court sports.",
      },
      {
        title: "Strength for Athletes",
        category: "Strength Training",
        durationMin: 60,
        price: 60,
        goals: ["athletic", "bodybuilding"],
        description: "Barbell strength program built around your sport and season.",
      },
    ],
  },
  {
    name: "Marcus Bell",
    email: "marcus@pocketcoach.test",
    bio: "Helps beginners build confidence in the gym and lose weight without crash diets.",
    specialties: ["weight-loss", "lifestyle"],
    yearsExperience: 10,
    location: "Northside Community Gym",
    availability: weekdays("08:00", "16:00"),
    services: [
      {
        title: "Fat Loss Kickstart",
        category: "Weight Loss",
        durationMin: 45,
        price: 50,
        goals: ["weight-loss"],
        description: "Full-body circuit training plus simple habit goals for the week.",
      },
      {
        title: "Beginner Strength Foundations",
        category: "Strength Training",
        durationMin: 45,
        price: 45,
        goals: ["lifestyle", "weight-loss"],
        description: "Learn the main lifts safely: squat, hinge, push and pull.",
      },
    ],
  },
  {
    name: "Priya Patel",
    email: "priya@pocketcoach.test",
    bio: "Certified nutrition coach focused on realistic meal plans that fit your schedule.",
    specialties: ["lifestyle", "weight-loss"],
    yearsExperience: 5,
    location: "Online or Westside Studio",
    availability: weekdays("09:00", "17:00"),
    services: [
      {
        title: "Nutrition Consultation",
        category: "Nutrition Coaching",
        durationMin: 30,
        price: 35,
        goals: ["lifestyle", "weight-loss", "bodybuilding"],
        description: "Review your eating habits and set calorie and protein targets.",
      },
      {
        title: "Monthly Nutrition Check-in",
        category: "Nutrition Coaching",
        durationMin: 30,
        price: 30,
        goals: ["lifestyle"],
        description: "Track progress and adjust your plan for the next month.",
      },
    ],
  },
];

async function removeOldSeedData() {
  const seedEmails = [ADMIN_EMAIL, ...trainers.map((t) => t.email)];
  const oldUsers = await User.find({ email: { $in: seedEmails } });
  const oldProfiles = await TrainerProfile.find({ user: { $in: oldUsers.map((u) => u._id) } });

  await Service.deleteMany({ trainer: { $in: oldProfiles.map((p) => p._id) } });
  await TrainerProfile.deleteMany({ _id: { $in: oldProfiles.map((p) => p._id) } });
  await User.deleteMany({ _id: { $in: oldUsers.map((u) => u._id) } });
  await Category.deleteMany({});
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding...");

  await removeOldSeedData();

  const createdCategories = await Category.insertMany(categories);
  const categoryId = (name) => createdCategories.find((c) => c.name === name)._id;

  // User.create runs the pre-save hook, so passwords get hashed
  await User.create({ name: "Admin", email: ADMIN_EMAIL, password: SEED_PASSWORD, role: "admin" });

  for (const t of trainers) {
    const user = await User.create({ name: t.name, email: t.email, password: SEED_PASSWORD, role: "trainer" });
    const profile = await TrainerProfile.create({
      user: user._id,
      bio: t.bio,
      specialties: t.specialties,
      yearsExperience: t.yearsExperience,
      location: t.location,
      availability: t.availability,
      approved: true,
    });
    await Service.insertMany(
      t.services.map((s) => ({ ...s, category: categoryId(s.category), trainer: profile._id }))
    );
    console.log(`Created ${t.name} with ${t.services.length} services`);
  }

  console.log(`Done. Seed accounts use the password: ${SEED_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());