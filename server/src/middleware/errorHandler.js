function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  // Duplicate value in a unique field (like email)
  if (err.code === 11000) {
    status = 409;
    message = "That email is already registered";
  }

  if (status === 500) console.error(err); // log unexpected errors for debugging
  res.status(status).json({ message: status === 500 ? "Server error" : message });
}

module.exports = { notFound, errorHandler };