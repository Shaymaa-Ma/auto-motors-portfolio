/*
const jwt = require("jsonwebtoken");

// =========================================================
// AUTHENTICATE ADMIN
// =========================================================

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // -----------------------------------------------------
    // Check Authorization header
    // -----------------------------------------------------

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -----------------------------------------------------
    // Extract token
    // -----------------------------------------------------

    const token = authHeader.split(" ")[1];

    // -----------------------------------------------------
    // Verify token
    // -----------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -----------------------------------------------------
    // Attach admin to request
    // -----------------------------------------------------

    req.admin = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

module.exports = {
  authenticateAdmin,
};
*/