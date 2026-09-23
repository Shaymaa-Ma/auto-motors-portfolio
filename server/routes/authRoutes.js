const express = require("express");

const {
  login,
  me,
  logout,
} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

const {
  loginLimiter,
} = require("../middleware/rateLimiter");


const router =
  express.Router();


// =========================================================
// PUBLIC
// =========================================================


// =========================================================
// POST /api/auth/login
// =========================================================
//
// Security:
//
// 1. IP-based failed-login limiter
// 2. Login controller
//
// The limiter is deliberately BEFORE the controller.
//
// Once the IP is blocked:
//
//      limiter
//          ↓
//      429 response
//          ↓
//      login controller is NOT executed
//
// Therefore the email/password is not processed at all
// while the IP is blocked.
// =========================================================

router.post(
  "/login",
  loginLimiter,
  login
);


// =========================================================
// PROTECTED
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


module.exports =
  router;