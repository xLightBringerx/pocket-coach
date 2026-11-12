const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const categoryRoutes = require("./routes/categoryRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const planRoutes = require("./routes/planRoutes");

const app = express();

// CLIENT_URL can list several addresses: "http://localhost:5173,https://pocket-coach.vercel.app"
const allowedOrigins = (process.env.CLIENT_URL || "").split(",").map((url) => url.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "500kb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/plans", planRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;