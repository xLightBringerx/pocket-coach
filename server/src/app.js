const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const categoryRoutes = require("./routes/categoryRoutes");
const trainerRoutes = require("./routes/trainerRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/trainers", trainerRoutes);

// These two must stay last
app.use(notFound);
app.use(errorHandler);

module.exports = app;