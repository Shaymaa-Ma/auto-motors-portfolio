const express = require("express");

const {
  login,
  me,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");
const { loginLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// =========================================================
// Public
// =========================================================

// POST /api/auth/login
// loginLimiter caps requests per IP; the per-account lockout
// (5 wrong passwords -> 10 min block) lives inside the
// login controller itself.
router.post("/login", loginLimiter, login);

// =========================================================
// Protected
// =========================================================

// GET /api/auth/me
router.get(
  "/me",
  authMiddleware,
  me
);

// POST /api/auth/logout
router.post(
  "/logout",
  authMiddleware,
  logout
);

module.exports = router;