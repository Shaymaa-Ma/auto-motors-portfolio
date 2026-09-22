const rateLimit = require("express-rate-limit");

// =========================================================
// Login rate limiter (per IP)
// =========================================================
//
// The per-account lockout in authController.js (5 wrong
// passwords -> 10 minute block) only tracks attempts against
// ONE email address. On its own, it does nothing to stop an
// attacker who tries many DIFFERENT emails from the same
// computer/IP — that traffic never touches any single
// account's failed_login_attempts counter, so it was
// completely unthrottled.
//
// This middleware adds a second, independent layer: it caps
// how many login requests a single IP address can make in a
// 15 minute window, regardless of which email is being tried.
// The two layers cover different attack patterns:
//
//   - account lockout  -> stops guessing one known email
//   - IP rate limit     -> stops guessing across many emails
//
// =========================================================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 login requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many login attempts from this network. Please try again later.",
  },
});

module.exports = { loginLimiter };