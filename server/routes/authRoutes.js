const express = require("express");

const {
  login,
  me,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================================
// Public
// =========================================================

// POST /api/auth/login
router.post("/login", login);

// =========================================================
// Protected
// =========================================================

// GET /api/auth/me
router.get("/me", authMiddleware, me);

// POST /api/auth/logout
router.post("/logout", authMiddleware, logout);

module.exports = router;