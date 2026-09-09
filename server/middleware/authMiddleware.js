const jwt = require("jsonwebtoken");

// =========================================================
// Protect admin routes
// =========================================================

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    // -----------------------------------------------------
    // No authentication cookie
    // -----------------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // -----------------------------------------------------
    // Verify JWT
    // -----------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // -----------------------------------------------------
    // Attach admin information to request
    // -----------------------------------------------------

    req.admin = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    // Invalid or expired JWT
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication.",
    });
  }
};

module.exports = authMiddleware;