
// Handle unexpected errors in one place so the API always returns
// a consistent response instead of exposing server details to the client.

const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;